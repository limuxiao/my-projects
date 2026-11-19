import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { formatElapsed, getElapsedMs } from '../utils/request-timing.util';

interface ErrorResponse {
  code: number;
  message: string;
  data: null;
  path: string;
  timestamp: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() !== 'http') {
      this.logger.error('Non-HTTP exception', exception instanceof Error ? exception.stack : undefined);
      return;
    }

    const http = host.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    // HttpException 用自身携带的状态码；其它异常（比如直接抛出的数据库错误）统一按 500 处理
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = isHttpException
      ? extractMessage(exception.getResponse())
      : 'Internal server error';

    const body: ErrorResponse = {
      code: status,
      message,
      data: null,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    };

    this.logger.error(
      `✖ ${req.method} ${req.originalUrl} ${status} ${formatElapsed(getElapsedMs(req))} ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    res.status(status).json(body);
  }
}

function extractMessage(response: string | object): string {
  if (typeof response === 'string') {
    return response;
  }
  const message = (response as { message?: string | string[] }).message;
  if (Array.isArray(message)) {
    return message.join('; ');
  }
  return message ?? 'Request failed';
}
