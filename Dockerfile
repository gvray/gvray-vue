# ==========================================
# 多阶段构建 Dockerfile
# Stage 1: 依赖安装
# Stage 2: 构建应用
# Stage 3: 生产环境运行
# ==========================================

# ==========================================
# Stage 1: 依赖安装
# ==========================================
FROM node:20-alpine AS deps

# 设置工作目录
WORKDIR /app

# 启用 corepack 以使用 pnpm（Node 20 自带）
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖（仅生产依赖）
RUN pnpm install --frozen-lockfile --prod=false

# ==========================================
# Stage 2: 构建应用
# ==========================================
FROM node:20-alpine AS builder

# 构建参数：支持 dev/staging/prod，默认 prod
ARG BUILD_ENV=prod

WORKDIR /app

# 启用 corepack 以使用 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 从 deps 阶段复制 node_modules
COPY --from=deps /app/node_modules ./node_modules

# 复制源代码（含 .env.{mode} 文件，vite 构建需要）
COPY . .

# 设置构建环境变量
ENV NODE_ENV=production
ENV BUILD_ENV=${BUILD_ENV}

# 根据 BUILD_ENV 执行对应环境的构建
RUN pnpm run build:${BUILD_ENV}

# ==========================================
# Stage 3: 生产环境运行
# ==========================================
FROM nginx:1.25-alpine AS runner

# 安装必要的工具
RUN apk add --no-cache curl tzdata

# 设置时区为上海
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 创建非 root 用户（用于运行 nginx）
RUN addgroup -g 1001 -S webapp && \
    adduser -S webapp -u 1001

# 复制 nginx 配置
COPY --chown=webapp:webapp docker/nginx.conf /etc/nginx/nginx.conf
COPY --chown=webapp:webapp docker/default.conf /etc/nginx/conf.d/default.conf

# 从 builder 阶段复制构建产物
# vite outDir 固定为 dist/，所有环境构建产物均输出到此处
COPY --from=builder --chown=webapp:webapp /app/dist /usr/share/nginx/html

# 复制自定义错误页面
COPY --chown=webapp:webapp docker/error-pages/404.html /usr/share/nginx/html/404.html
COPY --chown=webapp:webapp docker/error-pages/50x.html /usr/share/nginx/html/50x.html

# 创建日志目录
RUN mkdir -p /var/log/nginx && \
    chown -R webapp:webapp /var/log/nginx && \
    chown -R webapp:webapp /var/cache/nginx && \
    chown -R webapp:webapp /etc/nginx && \
    touch /var/run/nginx.pid && \
    chown -R webapp:webapp /var/run/nginx.pid

# 切换到非 root 用户
USER webapp

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
