import { Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { ThrottlerModule } from "@nestjs/throttler";
import { ThrottlerStorageRedisService } from "@nest-lab/throttler-storage-redis";
import { CoreModule } from "./core/core.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { BooksModule } from "./modules/books/books.module";
import { AuthorsModule } from "./modules/authors/authors.module";
import configuration from "./config/configuration";
import { validateEnv } from "./config/validation";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    LoggerModule.forRoot({
      pinoHttp: {},
    }),
    ThrottlerModule.forRootAsync({
      useFactory: () => {
        const url = process.env.REDIS_URL;
        Logger.log(
          `Initializing Throttler with Redis storage at ${url}`,
          "AppModule",
        );
        return {
          throttlers: [
            {
              name: "auth",
              ttl: 60,
              limit: 5,
            },
            {
              name: "default",
              ttl: 60,
              limit: 100,
            },
          ],
          storage: new ThrottlerStorageRedisService(url),
        };
      },
    }),
    CoreModule,
    AuthModule,
    UsersModule,
    BooksModule,
    AuthorsModule,
  ],
})
export class AppModule {}
