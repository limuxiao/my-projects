import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../users/interfaces/jwt-payload.interface';

// 管理员守卫：需与 JwtAuthGuard 配合使用（类级 @UseGuards(JwtAuthGuard) 在前）。
// JwtAuthGuard 校验 token 并把 payload 挂到 request.user，这里只负责检查 role。
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>();
    if (request.user?.role !== 'admin') {
      throw new ForbiddenException('需要管理员权限');
    }
    return true;
  }
}
