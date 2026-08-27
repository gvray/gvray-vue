# 🗺️ Gvray Vue Admin · 功能 Roadmap

基于 **Vue3 + Vite + Pinia + Element Plus + TypeScript**
的功能清单，状态以本仓库实际代码为准。

状态说明：

- [x] 已实现（代码中已存在）
- [ ] 未实现 / 规划中

> 标注依据：直接核查
> `src/views`、`src/components`、`src/composables`、`src/stores`、`src/directive`、`src/locales`、`mock/`、`scripts/`、`vite.config.ts`、`package.json`
> 等目录与配置。

---

## 🧠 核心能力（Runtime Core）

| 功能                         | 优先级 | 状态 | 说明 / 落地                                                                                         |
| ---------------------------- | ------ | ---- | --------------------------------------------------------------------------------------------------- |
| 用户鉴权（双 Token）         | 高     | [x]  | `src/utils/token.ts` access + refresh 双 Token；`src/views/login`、`src/stores/auth.ts`             |
| RBAC 权限管理                | 高     | [x]  | `src/directive/permission`（`v-hasPermi` / `v-hasRole` 指令）+ 动态路由                             |
| 动态路由                     | 高     | [x]  | `src/router` 基于权限生成路由与菜单                                                                 |
| 路由加载进度条（NProgress）  | 高     | [x]  | `src/permission.ts` 使用 `nprogress`                                                                |
| 页面过渡动画                 | 高     | [x]  | `AppMain.vue` 中 `<transition name="fade-transform">`                                               |
| keepAlive 页面缓存           | 高     | [x]  | `AppMain.vue` 中 `<keep-alive :include="[]">`                                                       |
| 全局状态管理                 | 高     | [x]  | Pinia + `pinia-plugin-persistedstate`；`src/stores`（auth / dict / setting）                        |
| 网络请求管线                 | 高     | [x]  | `@gvray/request` + `src/httpConfig.ts` 统一错误处理                                                 |
| 全局错误处理                 | 高     | [x]  | `src/main.ts` `app.config.errorHandler` + `src/views/error`（403 / 404）异常页兜底                  |
| 国际化（多语言）             | 中     | [x]  | `vue-i18n`；`src/locales`（zh-CN / en-US）+ `SelectLang` 切换组件                                   |
| 主题管理                     | 中     | [x]  | 浅色 / 深色 / 跟随系统 + 色弱 / 灰度模式；`src/utils/theme.ts`、`useThemeEffect.ts`、`ThemeSetting` |
| 全局消息中心 / 通知          | 中     | [x]  | `NoticeBell.vue` + `src/views/system/notice` 通知公告                                               |
| 运行时配置（Runtime Config） | 中     | [x]  | `src/constants/runtime-settings.ts` + `src/utils/runtime-config.ts`                                 |
| Mock 数据                    | 中     | [x]  | `mock/`（auth / dashboard / dictionary / notice）+ `vite-plugin-mock`                               |
| 请求缓存 & 去重              | 中     | [ ]  | 同一请求防重复调用（abortController / cache）                                                       |
| 页面级缓存 & 数据恢复        | 中     | [ ]  | 统一 useCache hook + localStorage / sessionStorage 策略                                             |
| 全局 Loading / Skeleton      | 中     | [ ]  | 暂无全局 Suspense / Skeleton 体系（仅个别页面局部使用）                                             |
| 全局快捷键                   | 中     | [ ]  | Ctrl+K 搜索 / 快捷键面板（hotkeys-js）                                                              |
| 全局水印                     | 中     | [ ]  | 仅 `runtime-settings.ts` 存在 `watermarkEnabled` 配置项，未实现渲染组件                             |
| WebSocket / SSE 实时推送     | 中     | [ ]  | 通知中心目前基于接口轮询，未接入实时推送                                                            |

---

## 🧩 业务功能模块

| 模块         | 优先级 | 状态 | 说明 / 落地                                                          |
| ------------ | ------ | ---- | -------------------------------------------------------------------- |
| 登录认证     | 高     | [x]  | `src/views/login`（含 LoginBg / LoginCard / PhoneInput）             |
| 注册         | 高     | [x]  | `src/views/register`                                                 |
| 仪表盘       | 高     | [x]  | `src/views/dashboard`（登录趋势、角色分布、活动时间线 + ECharts）    |
| 个人中心     | 高     | [x]  | `src/views/profile`（资料 / 安全 / 偏好 / 权限 / 登录日志 5 个 Tab） |
| 用户管理     | 高     | [x]  | `src/views/system/user`（含 UserForm + 分配角色）                    |
| 角色管理     | 高     | [x]  | `src/views/system/role`（含分配权限 / 分配用户）                     |
| 权限管理     | 高     | [x]  | `src/views/system/permission`                                        |
| 菜单管理     | 高     | [x]  | `src/views/system/menu`                                              |
| 部门管理     | 高     | [x]  | `src/views/system/department`                                        |
| 岗位管理     | 高     | [x]  | `src/views/system/position`                                          |
| 字典管理     | 高     | [x]  | `src/views/system/dictionary`（含字典项 items）+ `useDict` 字典 Hook |
| 参数配置     | 中     | [x]  | `src/views/system/config`                                            |
| 通知公告     | 中     | [x]  | `src/views/system/notice` + `NoticeBell`                             |
| 登录日志     | 中     | [x]  | `src/views/system/log/login`                                         |
| 操作日志     | 中     | [x]  | `src/views/system/log/operation`                                     |
| 在线用户监控 | 中     | [x]  | `src/views/monitor/online-user`                                      |
| 服务监控     | 中     | [x]  | `src/views/monitor/server`                                           |
| 缓存监控     | 中     | [x]  | `src/views/monitor/cache-monitor`                                    |
| 异常页       | 高     | [x]  | `src/views/error/403`、`src/views/error/404`                         |
| 文档页       | 低     | [x]  | `src/views/docs`                                                     |
| 占位页       | 低     | [x]  | `src/views/PlaceholderView`、`PagePlaceholder` 组件                  |

---

## 🧱 通用组件与 Hook

| 组件 / Hook                   | 状态 | 说明 / 落地                                                       |
| ----------------------------- | ---- | ----------------------------------------------------------------- |
| TablePro 增强表格             | [x]  | `src/components/TablePro` + `useTablePage` 高级搜索 / 分页 / 刷新 |
| Charts 图表                   | [x]  | `src/components/Charts`（ECharts 封装）+ `useChartToken`          |
| Icon 图标                     | [x]  | `src/components/Icon`（`vite-plugin-svg-icons` + svg 雪碧图）     |
| AuthButton                    | [x]  | `src/components/AuthButton` 权限按钮                              |
| StatusTag                     | [x]  | `src/components/StatusTag` 状态标签                               |
| SearchActions                 | [x]  | `src/components/SearchActions` 搜索操作区                         |
| BackButton                    | [x]  | `src/components/BackButton` 返回按钮                              |
| PageContainer                 | [x]  | `src/components/PageContainer` 页面容器                           |
| useDict                       | [x]  | `src/composables/useDict` 后端字典一键映射                        |
| useTablePage                  | [x]  | `src/composables/useTablePage` 表格分页 Hook                      |
| useModal                      | [x]  | `src/composables/useModal` 弹窗 Hook                              |
| useThemeEffect                | [x]  | `src/composables/useThemeEffect` 主题副作用                       |
| 面包屑 Breadcrumb             | [x]  | `src/layout/components/Breadcrumb`                                |
| 富文本编辑器                  | [ ]  | Markdown / WYSIWYG（tiptap 等）                                   |
| 文件上传下载                  | [ ]  | 大文件分片上传 / 进度条 / 预览                                    |
| 可拖拽布局 / Dashboard Widget | [ ]  | react-grid-layout 等同能力                                        |
| 动态表单 & 联动表单           | [ ]  | 字段依赖 / 权限控制                                               |

---

## 🏗 平台基础设施（Platform Infrastructure）

| 功能                  | 优先级 | 状态 | 说明 / 落地                                                            |
| --------------------- | ------ | ---- | ---------------------------------------------------------------------- |
| UI 组件库集成         | 高     | [x]  | Element Plus 2.x                                                       |
| 样式管理              | 高     | [x]  | Sass / SCSS + CSS 变量主题体系                                         |
| 开发代理              | 高     | [x]  | `vite.config.ts` `server.proxy` 配置                                   |
| OpenAPI 类型自动同步  | 中     | [x]  | `scripts/gen-api-types.ts`（openapi-typescript）→ `src/types/api.d.ts` |
| 本地开发热更新（HMR） | 高     | [x]  | Vite HMR                                                               |
| 自动导入              | 中     | [x]  | `unplugin-auto-import` + `unplugin-vue-components`                     |
| SVG 雪碧图            | 中     | [x]  | `vite-plugin-svg-icons`                                                |
| 缓存策略              | 中     | [x]  | `token.ts` localStorage + `storetify` + Pinia 持久化                   |
| 微前端架构            | 中     | [ ]  | Qiankun / single-spa 集成                                              |
| 微生成器 / CLI 工具   | 中     | [ ]  | 页面 / 模块 / API 快速生成（plop.js）                                  |
| 插件 / 扩展机制       | 中     | [ ]  | 可注入开发插件                                                         |
| 站点统计 / 行为分析   | 中     | [ ]  | PV / UV / 点击 / 表单埋点                                              |
| 日志系统 & 操作审计   | 中     | [ ]  | 请求日志 / 用户操作追踪上报                                            |

---

## 🛠 工程化 / DX（开发体验）

| 功能                | 优先级 | 状态 | 说明 / 落地                                                                            |
| ------------------- | ------ | ---- | -------------------------------------------------------------------------------------- |
| 多环境构建 & .env   | 高     | [x]  | `.env.dev` / `.env.staging` / `.env.prod` / `.env.example`                             |
| TypeScript 全面支持 | 高     | [x]  | `tsconfig.json` + `vue-tsc`                                                            |
| ESLint / Prettier   | 高     | [x]  | `eslint.config.js` + `eslint-plugin-vue` + `prettier`                                  |
| Git 提交钩子        | 高     | [x]  | `husky` pre-commit + `lint-staged` + `lavy`                                            |
| 构建优化            | 高     | [x]  | terser（drop_console）+ `manualChunks` + `cssCodeSplit` + `compression` + `visualizer` |
| 单元测试 / 集成测试 | 中     | [ ]  | Vitest / Jest（未接入）                                                                |
| DevTools / 调试面板 | 中     | [ ]  | 状态 / 权限 / 路由可视化                                                               |
| PWA / 离线模式      | 低     | [ ]  | Service Worker / Workbox                                                               |
| 性能监控            | 低     | [ ]  | web-vitals / Lighthouse                                                                |
| Sentry 错误上报     | 低     | [ ]  | 全局异常捕获并上报                                                                     |
| CI/CD 流程          | 高     | [ ]  | GitHub Actions / GitLab CI                                                             |
| 依赖升级 & 安全扫描 | 中     | [ ]  | npm audit / Renovate                                                                   |

---

## 📊 可观测性（Observability）

| 功能                    | 优先级 | 状态 | 说明 / 落地                    |
| ----------------------- | ------ | ---- | ------------------------------ |
| 请求日志 / 操作审计     | 中     | [ ]  | request 拦截器 + log 收集上报  |
| 异常监控 & 错误收集     | 中     | [ ]  | Sentry / Rollbar               |
| 性能分析 & 核心指标采集 | 中     | [ ]  | FCP / LCP / CLS / TBT          |
| 用户行为分析 / 埋点     | 中     | [ ]  | PV / UV / Click / Form         |
| 错误重试与告警通知      | 中     | [ ]  | retry + webhook / Slack / 钉钉 |

---

## 🔒 安全与合规

| 功能                      | 优先级 | 状态 | 说明 / 落地                          |
| ------------------------- | ------ | ---- | ------------------------------------ |
| 数据脱敏 & 水印           | 中     | [ ]  | 水印渲染组件未实现（仅运行时配置项） |
| XSS / CSRF / SQL 注入防护 | 高     | [ ]  | sanitize-html / axios CSRF token     |
| CSP 安全策略              | 中     | [ ]  | Content Security Policy              |
| GDPR / 隐私提示           | 中     | [ ]  | 隐私合规弹窗 / Cookie 管理           |

---

## 🔮 未来潜在能力

| 功能                 | 优先级 | 状态 | 说明 / 落地                     |
| -------------------- | ------ | ---- | ------------------------------- |
| AI / LLM 助手集成    | 低     | [ ]  | 智能填表 / 搜索 / 建议          |
| WebAssembly 模块化   | 低     | [ ]  | 高性能计算 / 图表               |
| 前端缓存层升级       | 中     | [ ]  | IndexedDB + Service Worker      |
| 前端 DevTools 可视化 | 中     | [ ]  | 状态 / 权限 / 路由 / 日志可视化 |
