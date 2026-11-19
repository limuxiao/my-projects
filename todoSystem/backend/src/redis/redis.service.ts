import { Injectable, OnApplicationShutdown } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnApplicationShutdown {
  private readonly client: Redis;

  // RedisModule 用 @Global() 标记并导出了 RedisService
  // 所以其它模块注入它时不需要再 imports RedisModule
  constructor(config: ConfigService) {
    this.client = new Redis({
      host: config.get<string>("REDIS_HOST", "localhost"),
      port: Number(config.get("REDIS_PORT", "6379")),
      password: config.get<string>("REDIS_PASSWORD") || undefined,
    });
    this.client.on("error", (err) => console.error("[Redis]", err.message));
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, "EX", ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  // 生命周期钩子：实现 OnApplicationShutdown 后，Nest 在应用关闭时自动调用，用来释放资源
  async onApplicationShutdown(): Promise<void> {
    await this.client.quit();
  }
}
