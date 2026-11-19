import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { markRequestStart } from './common/utils/request-timing.util';
import { AppModule } from './app.module';

const httpLogger = new Logger('HTTP');

async function bootstrap() {
  // NestFactory.create() 创建应用容器，所有模块和 Provider 在这里完成依赖注入
  const app = await NestFactory.create(AppModule);

  // 替换 Nest 全局 Logger：之后所有 new Logger() 都走 Winston，同时输出到控制台和按日期切分的文件
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // 开启 CORS，浏览器从其它域名访问这个 API 时才不会被同源策略拦截
  app.enableCors();

  // 全局管道：按 DTO 上的 class-validator 装饰器校验入参；transform: true 会把普通 JSON 转成 DTO 实例
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // app.use() 是 Express 中间件，执行时机比 Guard 更早；在这里打开始时间，供后续计算整个请求耗时
  app.use((req, _res, next) => {
    markRequestStart(req);
    httpLogger.log(`→ ${req.method} ${req.originalUrl} ip=${req.ip ?? '-'}`);
    next();
  });

  // 拦截器像洋葱一样嵌套：ResponseInterceptor 在外层、ClassSerializerInterceptor 在内层
  // 所以先用 @Exclude() 脱敏，再由外层包装统一响应体
  app.useGlobalInterceptors(
    new ResponseInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  // 全局过滤器：@Catch() 不传参数表示捕获所有异常，是请求生命周期的最后一环，统一错误响应格式
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  httpLogger.log(`Backend is running on http://localhost:${port}`);
}
bootstrap();
