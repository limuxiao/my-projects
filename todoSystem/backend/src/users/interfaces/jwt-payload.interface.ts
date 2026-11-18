import { UserRole } from '../entities/user.entity';

export interface JwtPayload {
  sub: number;
  phone: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
