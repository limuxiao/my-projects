# 前端 Dockerfile：Node 构建静态资源 → nginx 托管
# 阶段 1：构建
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Vite 构建：tsc 类型检查 + 打包；产物在 /app/dist
RUN npm run build

# 阶段 2：nginx 托管静态文件
FROM nginx:1.27-alpine AS runner

# 用自定义配置覆盖默认：SPA 路由回退 + /api 反向代理
COPY nginx.conf /etc/nginx/conf.d/default.conf
# 只复制构建产物，不把源码、node_modules 带进运行镜像
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
