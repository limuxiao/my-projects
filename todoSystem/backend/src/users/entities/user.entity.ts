import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type Gender = 'unknown' | 'male' | 'female';
export type UserRole = 'user' | 'admin';

export interface RealNameInfo {
  realName: string;
  idNumber: string;
  verified: boolean;
  submittedAt: string;
  verifiedAt?: string;
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  phone: string;

  @Exclude()
  @Column({ name: 'password_hash', length: 255, select: false })
  passwordHash: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  nickname: string | null;

  @Column({ type: 'enum', enum: ['unknown', 'male', 'female'], default: 'unknown' })
  gender: Gender;

  @Column({ type: 'int', nullable: true })
  age: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  occupation: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true, unique: true })
  email: string | null;

  @Column({ name: 'vip_level', type: 'tinyint', default: 0 })
  vipLevel: number;

  @Column({ name: 'real_name_info', type: 'json', nullable: true })
  realNameInfo: RealNameInfo | null;

  @Column({ type: 'json', nullable: true })
  tags: string[] | null;

  @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' })
  role: UserRole;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login_at', type: 'datetime', nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
