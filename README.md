# Gvray Vue Admin

🦄 基于 **Vue3**、**Vite**、**Pinia**、**Element Plus**、**TypeScript**
构建的企业级后台管理系统，专注于 **现代前端架构** 与 **RBAC 权限体系**
设计，提供动态路由、多主题、国际化、运行时配置、Mock、OpenAPI 等核心能力，可直接作为企业后台项目的 Starter
Template。

<!--
keywords:
vue,
vue3,
vite,
vite7,
element-plus,
element-plus-icons-vue,
typescript,
pinia,
vue-router,
vue-i18n,
axios,
rbac,
permission,
access-control,
dashboard,
admin,
admin-template,
starter-template,
boilerplate,
mock,
openapi,
i18n,
theme
-->

## 📸 项目预览

<!-- TODO: 补充 Vue 版本项目截图 docs/screenshots -->

## ✨ 核心能力

| 能力                 | 描述                                                  |
| -------------------- | ----------------------------------------------------- |
| 🔐 RBAC 权限管理     | 菜单、按钮（`v-hasPermi` / `v-hasRole` 指令）权限控制 |
| 🔑 双 Token 认证     | access + refresh 双 Token 管理，带过期缓冲策略        |
| 🧭 动态路由          | 基于权限自动生成路由与菜单                            |
| 🎨 多主题            | 支持浅色、深色等主题切换                              |
| 🌍 国际化            | 基于 vue-i18n 的多语言支持                            |
| 📖 全局字典系统      | `useDict` 后端字典一键映射                            |
| 🗂️ 状态管理          | Pinia 轻量状态管理，支持持久化                        |
| 🛡️ 全局错误处理      | 路由守卫与异常页（403 / 404）统一兜底                 |
| 🌐 数据请求          | `@gvray/request` Axios 请求管线与统一错误处理         |
| ⚙️ Runtime Config    | 运行时配置，无需重新构建即可调整部分配置              |
| 🎭 Mock              | vite-plugin-mock 与真实接口无缝切换                   |
| 📄 OpenAPI           | openapi-typescript 自动同步接口定义与 TypeScript 类型 |
| 🏗️ TablePro 增强表格 | 内置高级搜索、分页、刷新、`useTablePage` Hook         |
| 🐳 工程化            | TypeScript、ESLint、Prettier、Husky、lint-staged      |

## 🎯 适用场景

适合作为以下项目的基础框架：

- 企业后台管理系统
- SaaS 管理平台
- RBAC 权限系统
- 中后台管理平台
- Admin Starter Template
- 前端架构实践项目

## 🧩 核心功能模块

| 模块          | 功能                                         |
| ------------- | -------------------------------------------- |
| 👤 身份与权限 | 登录认证、注册、用户管理、角色管理、权限管理 |
| ⚙️ 系统管理   | 用户管理、字典管理、通知公告                 |
| 📊 系统监控   | 在线用户、服务监控、缓存监控                 |
| 👤 个人中心   | 个人资料、个人设置                           |
| 📝 错误页     | 403 异常页、404 异常页                       |

## 📖 文档导航

| 文档                                               | 说明               |
| -------------------------------------------------- | ------------------ |
| [Roadmap](docs/roadmap.md)                         | 功能规划与开发进度 |
| [Architecture Documentation](docs/architecture.md) | 系统架构设计与实现 |
| [Developer Guide](docs/developer-guide.md)         | 开发指南           |
| [Docker 部署指南](docs/docker.md)                  | Docker 化部署方案  |
| [Theme 规范](docs/theme-guidelines.md)             | 主题与样式设计规范 |
| [Contributing](docs/contributing.md)               | 提交规范与贡献指南 |

## 🚀 快速开始

### 环境要求

- Node.js >= 20.19（推荐使用 Corepack 启用 pnpm）
- pnpm

### 安装依赖

```bash
pnpm install
```

### 启动项目

```bash
# 默认开发环境（内置 Mock 数据）
pnpm dev

# 测试环境（连接 gvray-admin 后端）
pnpm dev:staging

# 生产环境配置预览
pnpm dev:prod
```

### 构建产物

```bash
# 构建所有环境
pnpm build

# 或按环境单独构建
pnpm build:dev      # 开发环境
pnpm build:staging  # 测试环境
pnpm build:prod     # 生产环境
```

### 其他命令

```bash
pnpm gen:api   # 通过 OpenAPI 同步接口 TypeScript 类型
pnpm lint      # 代码检查
pnpm lint:fix  # 代码检查并自动修复
pnpm format    # 格式化 JSON / Markdown / YAML
```

### 测试账号

| 环境                          | 账号                 | 密码                 |
| ----------------------------- | -------------------- | -------------------- |
| Mock（`pnpm dev`）            | `admin`              | `123456`             |
| Mock（`pnpm dev`）            | `super_admin`        | `123456`             |
| Staging（`pnpm dev:staging`） | 请参考后端初始化数据 | 请参考后端初始化数据 |

> 💡 推荐先启动 **gvray-admin** 后端，再使用 `staging` 环境体验完整功能。

更多配置请参考：

- `.env.dev`
- `.env.staging`
- `.env.prod`
- `.env.example`

后端仓库：

👉 https://github.com/gvray/gvray-admin

## 🌱 项目生态

| 仓库                                                    | 技术栈                               |
| ------------------------------------------------------- | ------------------------------------ |
| **[gvray-admin](https://github.com/gvray/gvray-admin)** | NestJS + Prisma                      |
| **[gvray-react](https://github.com/gvray/gvray-react)** | React + Umi                          |
| **[gvray-vite](https://github.com/gvray/gvray-vite)**   | React + Vite                         |
| **[gvray-vue](https://github.com/gvray/gvray-vue)**     | Vue3 + Vite + Element Plus（本仓库） |
| **[gvray-next](https://github.com/gvray/gvray-next)**   | Next.js                              |

## ❤️ 支持项目

如果这个项目对你有所帮助，欢迎点一个 **⭐ Star**。

你的支持，是项目持续迭代和完善的最大动力。
