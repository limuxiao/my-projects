import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { UserController } from './controlers/UserController';
import { AppService } from './app.service';
import { RedisModule } from './redis/redis.module';
import { TodosModule } from './todos/todos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get('DB_PORT', '3306')),
        username: config.get<string>('DB_USER', 'todosystem'),
        password: config.get<string>('DB_PASSWORD', 'todosystem_dev'),
        database: config.get<string>('DB_NAME', 'todosystem'),
        autoLoadEntities: true,
        synchronize: true,
        retryAttempts: 10,
        retryDelay: 3000,
      }),
    }),
    RedisModule,
    TodosModule,
  ],
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule {}
