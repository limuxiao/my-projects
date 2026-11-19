import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../users/interfaces/jwt-payload.interface';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    const user = request.user;
    // createParamDecorator 用来自定义参数装饰器：这里从 request 上取值，注入到控制器方法参数
    // 传了 data 就取 user 的某个字段，没传就取整个 user
    return data ? user[data] : user;
  },
);
