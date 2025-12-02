import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PinoLogger } from "nestjs-pino";
import { Request } from "express";

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(configService: ConfigService, private readonly logger:PinoLogger) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          if (request.cookies && request.cookies.accessToken) {
            return request.cookies.accessToken;
          }
          return null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("auth.jwtAccessSecret"),
    });
  }

  async validate(payload: JwtPayload) {
    // this.logger.info(`Validating JWT for user ID: ${payload.sub}`);
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
