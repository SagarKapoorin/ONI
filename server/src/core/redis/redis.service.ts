import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, RedisClientType } from "redis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  private readonly logger = new Logger(RedisService.name);
  private readonly url: string;
  private readonly defaultTtlSeconds: number;

  constructor(private readonly configService: ConfigService) {
    this.url =
      this.configService.get<string>("redis.url") || "redis://localhost:6379";
    this.defaultTtlSeconds =
      this.configService.get<number>("redis.ttlSeconds") ?? 3600;
    this.client = createClient({ url: this.url });
  }

  async onModuleInit() {
    this.logger.log(`Connecting to Redis at ${this.url}`);
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const pingResult = await this.client.ping();
      this.logger.log(`Redis connected at ${this.url}, PING -> ${pingResult}`);
      // const testKey = "test:redis-service";
      // const testValue = new Date().toISOString();
      // await this.client.set(testKey, testValue, { EX: 600 });
      // this.logger.log(`Wrote test key "${testKey}" to Redis with TTL=600s`);
    } catch (error) {
      this.logger.error(
        `Failed to connect to Redis at ${this.url}`,
        error as Error,
      );
    }
  }

  async onModuleDestroy() {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }

  async acquireLock(key: string, ttlSeconds: number): Promise<boolean> {
    const result = await this.client.set(key, "locked", {
      NX: true,
      EX: ttlSeconds,
    });
    this.logger.debug(
      `acquireLock key=${key} ttl=${ttlSeconds}s result=${result}`,
    );
    return result === "OK";
  }

  async releaseLock(key: string): Promise<void> {
    this.logger.debug(`releaseLock key=${key}`);
    await this.client.del(key);
  }

  // Generic helpers for caching data in Redis
  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) {
      return null;
    }
    try {
      this.logger.debug('value:', value);
      return JSON.parse(value) as T;
    } catch {
      // Fallback if value was stored as plain string
      return value as unknown as T;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized =
      typeof value === "string" ? value : JSON.stringify(value);
    const ttl = ttlSeconds ?? this.defaultTtlSeconds;
    if (ttl && ttl > 0) {
      await this.client.set(key, serialized, { EX: ttl });
    } else {
      await this.client.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async resetPrefix(prefix: string): Promise<void> {
    const pattern = `${prefix}*`;
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(keys);
      this.logger.debug(
        `resetPrefix("${prefix}") deleted keys: ${keys.join(", ")}`,
      );
    } else {
      this.logger.debug(`resetPrefix("${prefix}") found no keys`);
    }
  }
}
