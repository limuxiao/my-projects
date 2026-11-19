import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, map } from 'rxjs';
import { formatElapsed, getElapsedMs } from '../utils/request-timing.util';

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const { method, originalUrl } = req;

    // 拦截器分两段：next.handle() 之前是控制器执行前，pipe(map) 里是控制器执行后
    return next.handle().pipe(
      map((data: unknown) => {
        // 控制器已经返回，在这里把原始返回值包装成统一响应体
        const payload: ApiResponse<unknown> = {
          code: res.statusCode,
          message: 'success',
          data: data === undefined ? null : data,
          timestamp: new Date().toISOString(),
        };
        this.logger.log(
          `← ${method} ${originalUrl} ${res.statusCode} ${formatElapsed(getElapsedMs(req))}`,
        );
        return payload;
      }),
    );
  }
}
