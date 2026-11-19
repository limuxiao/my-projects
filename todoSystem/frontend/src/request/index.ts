import axios, { type AxiosError } from 'axios'
import type { ApiResponse } from '@/types'

// 创建一个 axios 实例，统一配置 baseURL：之后写相对路径即可，不用每次拼域名
const http = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// 请求拦截器：每个请求发出前都会经过这里
// 在这里统一注入 token，业务代码就不需要每次手动传 Authorization 头
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('todosystem_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config // 必须 return config，请求才会继续发出
})

// 响应拦截器：分成功和失败两个回调
http.interceptors.response.use(
  // 成功时直接返回 response.data，也就是后端那层 {code,message,data} 外壳
  (response) => response.data,
  // 失败时统一处理：401 清 token 并跳登录，其它错误转成 Error 抛出
  (error: AxiosError<ApiResponse<null>>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('todosystem_token')
      if (!window.location.pathname.includes('/login')) {
        window.location.assign('/login') // 用 assign 而非 navigate，确保跳转彻底
      }
    }
    // 后端校验失败时 message 可能是数组，这里拼成字符串
    const message = error.response?.data?.message || error.message || '请求失败'
    // reject 出去的错误，会被组件里的 catch 接住
    return Promise.reject(new Error(Array.isArray(message) ? message.join('；') : message))
  },
)

// 泛型函数：调用方用 request<Todo[]>(...) 指定返回类型，拿到的数据就有类型提示
// Parameters<typeof http.request>[0] 是 TS 技巧：取出 http.request 第一个参数的类型
export async function request<T>(config: Parameters<typeof http.request>[0]): Promise<T> {
  // 拦截器已经把外壳拆掉了，所以这里 response 就是 ApiResponse<T>，再取 data 即是业务数据
  const response = (await http.request(config)) as ApiResponse<T>
  return response.data
}
