import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { RedisModule } from "./redis/redis.module";
import { TodosModule } from "./todos/todos.module";
import { UsersModule } from "./users/users.module";
import { winstonConfig } from "./common/logger/winston.config";

@Module({
  imports: [
    winstonConfig,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.ENV_FILE || '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // forRootAsync 用异步工厂注入 ConfigService 读取数据库配置，等价于同步的 forRoot
      useFactory: (config: ConfigService) => ({
        type: "mysql" as const,
        host: config.get<string>("DB_HOST", "localhost"),
        port: Number(config.get("DB_PORT", "3306")),
        username: config.get<string>("DB_USER", "todosystem"),
        password: config.get<string>("DB_PASSWORD", "todosystem_dev"),
        database: config.get<string>("DB_NAME", "todosystem"),
        autoLoadEntities: true,
        synchronize: true,
        retryAttempts: 10,
        retryDelay: 3000,
      }),
    }),
    RedisModule,
    TodosModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
