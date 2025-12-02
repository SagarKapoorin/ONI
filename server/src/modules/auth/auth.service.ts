import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { UsersRepository } from "../users/users.repository";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new UnauthorizedException("Email already in use");
    }
    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersRepository.createUser({
      email: dto.email,
      password: hash,
      name: dto.name,
    });
    const tokens = this.generateTokens(user.id, user.email, user.role);
    return {
      user,
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const tokens = this.generateTokens(user.id, user.email, user.role);
    return {
      user,
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>("auth.jwtRefreshSecret"),
      });
      const user = await this.usersRepository.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException("Invalid token");
      }
      const tokens = this.generateTokens(user.id, user.email, user.role);
      return {
        user,
        ...tokens,
      };
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }

  private generateTokens(userId: number, email: string, role: string) {
    const accessPayload = { sub: userId, email, role };
    const refreshPayload = { sub: userId };
    const accessExpiresIn = this.configService.get<string>(
      "auth.jwtAccessExpiresIn",
    );
    const refreshExpiresIn = this.configService.get<string>(
      "auth.jwtRefreshExpiresIn",
    );

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.getOrThrow<string>("auth.jwtAccessSecret"),
      expiresIn: accessExpiresIn as JwtSignOptions["expiresIn"],
    });
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.getOrThrow<string>("auth.jwtRefreshSecret"),
      expiresIn: refreshExpiresIn as JwtSignOptions["expiresIn"],
    });
    return { accessToken, refreshToken };
  }
}
