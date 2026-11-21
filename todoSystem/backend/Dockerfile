# 后端 Dockerfile：运行镜像（只部署，不构建）
#
# 注意：本镜像不再包含 TypeScript 构建阶段，只托管本地已编译的 dist/。
# 前提：需先在本地执行 `npm run build` 产出 dist/
# 构建上下文必须是 backend/ 目录（COPY 路径均相对该目录）
#   手动构建：cd backend && docker build -t todo_back:1.0.2 .
# ============================================================

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# tini 作为 PID 1，正确转发信号、回收僵尸进程
RUN apk add --no-cache tini

# 只安装生产依赖；不做编译
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# 本地已编译的 JS 产物
COPY dist ./dist

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

# 生产启动：直接跑编译产物
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main"]
