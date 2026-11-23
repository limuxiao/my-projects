export interface ApiResponse<T> {
  code: number
  message: string | string[]
  data: T
  timestamp: string
}

export type Gender = 'unknown' | 'male' | 'female'
export type UserRole = 'user' | 'admin'

export interface RealNameInfo {
  realName: string
  idNumber: string
  verified: boolean
  submittedAt: string
  verifiedAt?: string
}

export interface User {
  id: number
  phone: string
  nickname: string | null
  gender: Gender
  age: number | null
  occupation: string | null
  avatar: string | null
  email: string | null
  vipLevel: number
  realNameInfo: RealNameInfo | null
  tags: string[] | null
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LoginResult {
  accessToken: string
  tokenType: string
  expiresIn: string
  user: User
}

export interface LoginDto {
  phone: string
  password: string
}

export interface RegisterDto extends LoginDto {
  nickname?: string
}
