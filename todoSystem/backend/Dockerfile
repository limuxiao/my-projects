# 后端 Dockerfile：多阶段构建，只把运行所需的东西带进最终镜像
# 阶段 1：依赖 + 编译
FROM node:22-alpine AS builder
WORKDIR /app

# 先只复制依赖清单，利用 Docker 层缓存：清单不变时 npm ci 不会重跑
COPY package*.json ./
RUN npm ci

COPY tsconfig.json nest-cli.json ./
COPY src ./src
RUN npm run build

# 阶段 2：生产依赖
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
# --omit=dev 不装 typescript / nest cli 等开发依赖
RUN npm ci --omit=dev && npm cache clean --force

# 阶段 3：最终运行镜像
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# tini 作为 PID 1，正确转发信号、回收僵尸进程
RUN apk add --no-cache tini

# 从 deps 阶段拿生产依赖，从 builder 阶段拿编译产物
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# 运行时配置：把生产 env 文件放进镜像，并告诉 ConfigModule 读取它
COPY .env.prd ./.env.prd
ENV ENV_FILE=/app/.env.prd

# 日志目录：winston 按日期写文件，容器里必须存在且属主可写
# node 官方镜像自带 node 用户（uid 1000）
RUN mkdir -p /app/logs && chown -R node:node /app

# 非 root 运行，降低容器逃逸风险
USER node

# 与 .env.prd 中的 PORT 保持一致
# 注意：.env.prd 中 DB_HOST/REDIS_HOST 为 localhost，运行时需使用 --network host
EXPOSE 3099

# 生产启动：直接跑编译产物，不走 nest CLI（start:prod = node dist/main）
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main"]
