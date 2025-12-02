import { Body, Controller, Post, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import { Throttle } from "@nestjs/throttler";
import { PinoLogger } from "nestjs-pino";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly logger:PinoLogger) {}

  @Post("signup")
  @Throttle({ auth: {} })
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signup(dto);
    this.setAuthCookie(res, result.accessToken);
    // this.logger.info(`New user signed up: ${result.accessToken}`);
    return {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  @Post("login")
  @Throttle({ auth: {} })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    this.setAuthCookie(res, result.accessToken);
    // this.logger.info(`User logged in: ${result.accessToken}`);
    return {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  @Post("refresh")
  @Throttle({ auth: {} })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.refresh(dto.refreshToken);
    this.setAuthCookie(res, result.accessToken);
    // this.logger.info(`Token refreshed: ${result.refreshToken}`);
    return {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() _user: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.info(`User logged out: ${_user.userId}`);
    res.clearCookie("accessToken");
    return { success: true };
  }

  private setAuthCookie(res: Response, token: string) {
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });
  }
}
