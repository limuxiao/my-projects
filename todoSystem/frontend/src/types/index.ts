// 与后端 DTO / 响应体对齐的类型定义
// interface 用于描述对象结构；type 可以给类型起别名、定义联合类型
// 这里集中定义，前后端字段保持一致，改一处全项目提示都会更新

// 泛型接口：T 是占位符，用 ApiResponse<User> 时 data 就自动变成 User 类型
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  timestamp: string
  path?: string // 末尾的 ? 表示可选字段，失败响应才有 path
}

// 字面量联合类型：取值被限制在这几个字符串里，拼错会直接报错
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

export interface RegisterDto {
  phone: string
  password: string
  nickname?: string
}

export interface LoginDto {
  phone: string
  password: string
}

export interface Todo {
  id: number
  title: string
  description: string | null
  completed: boolean
  userId: number
  createdAt: string
  updatedAt: string
}

export interface CreateTodoDto {
  title: string
  description?: string
}
