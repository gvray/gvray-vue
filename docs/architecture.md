# 🏗️ architecture.md

## 项目架构设计总览

**Gvray Vue Admin** 是 gvray-react（React +
Umi）的 Vue3 重写版本，聚焦通用后台架构与工程实践，旨在构建一个可复用、高可维护、可扩展的现代前端管理系统。核心架构基于
**Vue 3 + Vite + Pinia + Element Plus +
TypeScript**，配合动态路由、RBAC 权限体系、双 Token 认证与运行时配置，支持中大型业务系统的稳健演进。

整体架构可以按逻辑层拆分：

```
UI Layer (Vue 3 + Element Plus)
       ↓
Routes & Layout (vue-router 4 + 自定义 Layout)
       ↓
State Management (Pinia + pinia-plugin-persistedstate)
       ↓
Network Layer (@gvray/request 封装 axios)
       ↓
Business Domain Modules (RBAC / 用户体系 / 系统配置 / 系统监控)
```

组件库与风格统一规范则通过 `Element Plus + SCSS + CSS 变量`
组合方案实现，主色与主题通过 `useThemeEffect` 在运行时注入 `:root` 变量。

---

## 技术选型与设计理由

| 领域      | 选型                                    | 设计理由                                          |
| --------- | --------------------------------------- | ------------------------------------------------- |
| 框架      | Vue 3 + `<script setup>` + TypeScript   | 组合式 API 灵活、类型推断友好，适合中大型后台     |
| 构建工具  | Vite                                    | 原生 ESM 开发体验、插件化体系、构建产物可分包优化 |
| 路由      | vue-router 4 + `createWebHistory`       | 标准历史模式路由，配合守卫实现权限拦截            |
| 状态管理  | Pinia + `pinia-plugin-persistedstate`   | 轻量直观，模块化 store，支持按字段持久化          |
| UI 组件库 | Element Plus                            | 企业级组件完备，原生支持暗色 CSS 变量与国际化     |
| 网络请求  | `@gvray/request`（封装 axios）          | 统一拦截器、错误抛出与处理、Token 刷新 preset     |
| 国际化    | vue-i18n（Composition API 模式）        | 扁平 key 兼容菜单 code，按需懒加载语言包          |
| Mock      | vite-plugin-mock                        | 开发期真实接口模拟，与后端联调无缝切换            |
| 接口类型  | openapi-typescript                      | 通过 OpenAPI 自动同步后端类型定义                 |
| 工程化    | ESLint + Prettier + Husky + lint-staged | 统一代码风格，提交前自动校验                      |

---

## 整体目录结构

```
gvray-vue/
├── docs/                      # 项目文档（README、架构文档等）
├── mock/                      # vite-plugin-mock 数据源（auth/dashboard/dictionary/notice）
├── public/                    # 静态资源（直接拷贝到产物根目录）
├── src/
│   ├── api/                   # 接口定义（按业务域拆分，类型由 OpenAPI 生成）
│   ├── assets/                # 字体、图片、全局样式（styles/index.scss）
│   ├── components/            # 全局通用组件（TablePro、AuthButton、StatusTag 等）
│   ├── composables/           # 组合式函数（useDict、useTablePage、useThemeEffect）
│   ├── constants/             # 常量（权限码 PERM、主题类型、运行时配置默认值）
│   ├── directive/             # 自定义指令（permission: v-hasPermi / v-hasRole）
│   ├── layout/                # 布局骨架（index.vue + components/）
│   │   └── components/        # SideBar、NavBar、AppMain、Breadcrumb、UserMenu 等
│   ├── locales/                # 国际化资源（zh-CN / en-US，按模块拆分）
│   ├── router/                # 路由定义（constantRoutes + dynamicRoutes）与工具函数
│   ├── stores/                # Pinia store（auth、setting、dict）
│   ├── types/                 # 全局类型声明（auto-imports.d.ts 等）
│   ├── utils/                 # 工具（token、runtime-config、errors、theme、url、logger）
│   ├── views/                 # 页面级组件（按业务域：system、monitor、error、profile）
│   ├── App.vue                # 根组件（ElConfigProvider + 主题副作用 + 语言同步）
│   ├── httpConfig.ts          # @gvray/request 错误处理与拦截器配置
│   ├── main.ts                # 应用入口（bootstrap 启动流程）
│   ├── permission.ts          # 路由守卫（beforeEach / afterEach）
│   ├── request.ts             # 请求客户端实例（createClient + preset）
│   └── vite-env.d.ts          # Vite 环境类型声明
├── vite/                      # Vite 插件配置（auto-import、components、mock、compression 等）
├── vite.config.ts             # Vite 主配置（define、proxy、resolve、build 分包）
├── .env.dev / .env.staging / .env.prod   # 多环境变量
└── package.json
```

---

## 核心模块详解

### 1. 应用启动流程

入口文件 `src/main.ts` 通过 `bootstrap()`
函数编排启动顺序，核心思想是**先完成运行时配置与认证初始化，再挂载应用**，确保首屏渲染时 store 与路由已就绪：

```
createApp(App)
   ↓
app.use(store)                       # 安装 Pinia（含持久化插件）
   ↓
initializeRuntime()                  # 拉取 /system/config 运行时配置
   ├─ runtimeConfig.set(res.data)     # 写入单例（非响应式）
   ├─ document.title = systemName
   └─ settingStore.$patch(...)        # 优先级：runtime default < persisted < 用户偏好
   ↓
initializeAuth()                     # 仅在 tokenManager.isAuthenticated() 为真时执行
   ├─ Promise.allSettled([queryMe, queryMenus])
   ├─ 失败则 clearTokens() 返回 false
   └─ authStore.setAuth(me, menus)     # 写入 profile / menus / permissions
   ↓
若已认证：Promise.all([
   initializeRoutes(),                # addDynamicRoutes(dynamicRoutes, permissions)
   initializeDictionaries(),          # 预加载 common_status 字典
])
   ↓
app.use(router).use(i18n).use(ElementPlus)
app.use(setupPermissionDirectives)    # 注册 v-hasPermi / v-hasRole
   ↓
app.mount('#app')
```

启动全程通过 `try/catch`
兜底，初始化失败仅记录日志不阻塞挂载。`import '@/request'`
在模块加载阶段即完成请求客户端实例化，确保后续 API 调用可直接复用。

### 2. 路由与权限守卫

#### 路由结构

路由定义在 `src/router/index.ts`，分为两层：

| 类型             | 说明                       | 示例                                                                          |
| ---------------- | -------------------------- | ----------------------------------------------------------------------------- |
| `constantRoutes` | 公共路由，所有用户可访问   | `/login`、`/register`、`/`（Dashboard）、`/profile`、`/docs`、`/403`、`/404`  |
| `dynamicRoutes`  | 动态路由，按权限过滤后注册 | `/system/*`（用户/角色/权限/菜单/字典等）、`/monitor/*`（服务/在线用户/缓存） |

动态路由通过 `meta.permissions` 字段声明所需权限码，采用 `system:user:list`
格式（详见 `src/constants/permission.ts` 的 `PERM` 常量集合）。Router 使用
`createWebHistory()`，并自定义 `scrollBehavior`
在浏览器前进/后退时恢复滚动位置。

#### 动态路由注册

`src/router/utils.ts` 提供幂等的动态路由注册能力：

- `filterDynamicRoutes(routes, permissions)`：递归过滤路由，`meta.permissions`
  为空或用户拥有 `*:*:*` 超管权限直接放行，否则校验
  `required.every(p => permissions.includes(p))`。
- `addDynamicRoutes(routes, permissions)`：先调用 `resetDynamicRoutes()`
  移除旧动态路由（通过保存的 `remove` 回调），再按过滤结果 `router.addRoute`
  注册，保证登出/切换账号后路由表干净。

#### 路由守卫

`src/permission.ts` 通过 `router.beforeEach` 实现全局前置守卫：

1. 开启 `NProgress` 进度条并记录跳转日志。
2. 通过 `tokenManager.isAuthenticated()` 判断登录态（access 或 refresh
   token 任一有效即视为已登录）。
3. **已登录**：
   - 访问 `/login` 则重定向到 `/`。
   - 校验 `to.meta.permissions`，无权限则跳 `/403`。
   - 其余放行。
4. **未登录**：在
   `WHITE_LIST`（`/login`、`/register`、`/forget-password`、`/404`）内的路径放行，否则通过
   `getLoginRedirect` 携带回跳地址跳登录页。
5. `afterEach` 中结束进度条。

#### 按钮级权限指令

`src/directive/permission/` 提供 `v-hasPermi` 与 `v-hasRole` 两个自定义指令，在
`mounted` 阶段读取 `useAuthStore()`：

- 超管（`profile.isSuperAdmin`）直接放行；
- 否则校验权限码（支持字符串或数组），不满足则 `el.parentNode.removeChild(el)`
  物理移除节点。

### 3. 状态管理（Pinia + 持久化）

Pinia 在 `src/stores/index.ts` 中创建，并通过 `pinia-plugin-persistedstate`
注入持久化能力，统一 `key` 前缀为 `gvray-{id}`。三个核心 store 各司其职：

| Store             | 文件                | 职责                                                   | 持久化                                                     |
| ----------------- | ------------------- | ------------------------------------------------------ | ---------------------------------------------------------- |
| `useSettingStore` | `stores/setting.ts` | UI 偏好（主题、主色、语言、布局、辅助功能等）          | 是，`key: app-settings`，按 `paths` 白名单持久化 15 个字段 |
| `useAuthStore`    | `stores/auth.ts`    | 用户档案 `profile`、菜单 `menus`、权限码 `permissions` | 否（运行时从 `queryMe`/`queryMenus` 重建）                 |
| `useDictStore`    | `stores/dict.ts`    | 字典缓存 `cache` 与加载中标记 `loading`                | 否（运行时按需拉取）                                       |

`SettingState` 额外维护 `systemTheme`（由 `useThemeEffect` 监听 OS
`prefers-color-scheme` 写入，不持久化），并提供 `resolvedTheme` / `isDark`
getter 解析 `system` 模式。`toggleDarkMode` 在 `light → dark → system`
三态间循环。`patchSettings` 接受 `Partial<UserSettings>` 批量更新，被
`initializeAuth` 用于回写 `me.preferences`。

### 4. 请求管线（@gvray/request + httpConfig）

请求层基于 `@gvray/request` 对 axios 进行封装，分为两部分。

#### 客户端实例

`src/request.ts` 通过 `createClient` 创建实例，关键配置：

- `timeout` / `baseURL`：由 Vite `define` 注入的 `__APP_API_TIMEOUT__` /
  `__APP_API_URL__` 提供（源自 `.env.*` 的 `APP_` 变量）。
- `errorConfig`、`requestInterceptors`、`responseInterceptors`：来自
  `httpConfig.ts`。
- `preset`（内置扩展点）：
  - **bearerAuth**：`getToken` 读取 `tokenManager.getAccessToken()` 自动注入
    `Authorization` 头。
  - **requestAuthRefresh**：access token 失效时，使用 refresh token 调用
    `/auth/refresh` 续期；`exclude: ['/auth/login', '/auth/refresh']`
    避免死循环；refresh token 也失效则返回 `null` 触发重登录。
  - **logging**：开启请求日志，生产环境建议关闭。

#### 错误处理与拦截器

`src/httpConfig.ts` 定义统一错误管线：

- `errorThrower`：当 2xx 响应的 `data.success === false` 时，调用
  `throwBizError` 抛出业务错误（交由 `errorHandler` 处理）。
- `errorHandler`：
  - 支持 `opts.skipErrorHandler` 跳过统一处理（由调用方自行 catch）。
  - `status === 401` 时走
    `handle401Unauthorized`：在登录页则销毁弹窗；未登录直接
    `redirectToLogin`；refresh token 已过期也直接跳转；其余场景 `showAuthModal`
    询问用户是否重新登录。
  - 其余错误按 `ErrorShowType` 分发：`SILENT` 静默、`WARN_MESSAGE` /
    `ERROR_MESSAGE` 走 `ElMessage`、`NOTIFICATION` 走
    `ElNotification`、`REDIRECT` 预留。
- `requestInterceptors` / `responseInterceptors`：预留扩展点，HTTP 日志已由
  `logging` preset 统一处理，避免重复记录。

#### Token 管理

`src/utils/token.ts` 基于 `storetify` 实现带 TTL 的 token 存储：

- access / refresh token 的 key 由 `__APP_API_TOKEN_KEY__` 派生。
- `setAccessToken` / `setRefreshToken` 在写入时扣除
  `BUFFER_TIME`（`APP_API_TIMEOUT/1000 + 5`
  秒）作为提前过期缓冲，避免请求途中 token 失效。
- `isAuthenticated()`
  判定：access 或 refresh 任一未过期即视为已登录，给 refresh 机制留出续期窗口。

### 5. 主题切换机制

主题副作用集中在 `src/composables/useThemeEffect.ts`，仅在 `App.vue`
根组件调用一次，职责包括：

1. **OS 主题监听**：`onMounted` 时立即同步当前系统主题，并通过
   `startSystemThemeWatcher` 订阅 `prefers-color-scheme` 变化写入
   `settingStore.systemTheme`；`onUnmounted` 时停止监听。
2. **dark / light class**：`watch(resolvedTheme)` 在 `<html>` 上切换 `dark`
   class（`immediate` 立即触发一次）。
3. **辅助功能**：`watch(colorWeak)` / `watch(grayMode)` 在 `<body>` 上切换
   `color-weak`（反色）/ `gray-mode`（灰度）class，对应 `App.vue` 中的样式定义。
4. **主色变量注入**：`watch(colorPrimary)` 通过 `@gvray/colorkit` 的 `lighten` /
   `darken` 派生 hover、active、背景、边框等色阶，动态写入一个
   `#gvray-theme-vars` `<style>` 标签注入 `:root`，覆盖 Element Plus 与
   `gvray-*` 两套 CSS 变量。

主题模式 `ThemeMode` 支持 `'light' | 'dark' | 'system'`，`SiderTheme`
独立控制侧栏明暗。`ColorPrimary` 限定为 11 个预设色值并配有国际化 key（见
`src/constants/theme.ts`）。

### 6. 国际化（vue-i18n）

`src/locales/index.ts` 通过 `createI18n` 创建实例，采用 Composition
API 模式（`legacy: false`）：

- `locale` 默认取 `__APP_DEFAULT_LANGUAGE__`（源自 `.env.*` 的
  `APP_DEFAULT_LANGUAGE`），`fallbackLocale` 为 `zh-CN`。
- **`flatJson: true`**：从 React 迁移过来的菜单 code 是扁平 key（如
  `menu.system`），vue-i18n 默认会把 `.` 当作嵌套路径，开启 `flatJson`
  才能正确解析。
- `silentFallbackWarn: true` + `missingWarn: false`：生产环境屏蔽缺失 key 警告。
- 语言包按模块拆分（`login`、`menu`、`permission`、`profile`、`theme`），分别在
  `zh-CN` / `en-US` 目录组织后聚合导出。
- `setI18nLanguage(locale)` 集中切换 `i18n.global.locale.value` 与
  `document.documentElement.lang`。

`App.vue` 通过 `el-config-provider` 注入 Element Plus 的语言包（`zh-CN` /
`en-US`），并 `watch(settingStore.language)` 同步 vue-i18n 的 `locale.value` 与
`<html lang>`，确保业务文案与组件文案一致。

### 7. Mock（vite-plugin-mock）

Mock 能力由 `vite/plugins/mock.ts` 通过 `viteMockServe` 提供：

- `mockPath: 'mock'`：Mock 数据源目录位于项目根 `mock/`，现有
  `auth.ts`、`dashboard.ts`、`dictionary.ts`、`notice.ts`。
- `watchFiles: true`：文件变更热更新。
- `enable: true`：默认开启，开发环境（`pnpm dev`）内置 Mock 数据可直接登录（账号
  `admin` / `super_admin`，密码 `123456`）。

通过 `.env.*` 的 `APP_API_URL` 与 Vite `server.proxy`（将 `/gvray-api` 转发到
`https://api.gvray.com`）配合，开发期可在 Mock、本地后端、远程后端之间灵活切换：

| 命令               | 环境                           | 数据来源         |
| ------------------ | ------------------------------ | ---------------- |
| `pnpm dev`         | dev（`APP_MOCK_ENABLED=true`） | vite-plugin-mock |
| `pnpm dev:staging` | staging                        | gvray-admin 后端 |
| `pnpm dev:prod`    | prod 配置预览                  | 生产 API         |

---

## 多环境与构建配置

### 环境变量体系

项目通过 `.env.dev` / `.env.staging` / `.env.prod`
三套环境变量实现多环境解耦。`vite.config.ts` 中的 `buildAppDefines(mode)`
会把所有 `APP_` 前缀的变量注入为 `__APP_*__` 全局常量（如 `APP_API_URL` →
`__APP_API_URL__`），与 React 项目保持一致，供
`request.ts`、`token.ts`、`locales/index.ts` 等模块直接读取。

核心变量（参考 `.env.example`）：

| 变量                             | 用途                           |
| -------------------------------- | ------------------------------ |
| `APP_ENV`                        | 当前环境标识，可在代码内判断   |
| `APP_API_URL` / `APP_API_ORIGIN` | API 基地址与后端源             |
| `APP_API_TOKEN_KEY`              | Token 存储 key 前缀            |
| `APP_API_TIMEOUT`                | 请求超时（毫秒）               |
| `APP_MOCK_ENABLED`               | 是否开启本地 Mock              |
| `APP_DEFAULT_LANGUAGE`           | 默认语言                       |
| `APP_VERSION` / `APP_BUILD_TIME` | 构建版本号与时间（CI/CD 注入） |
| `APP_SENTRY_DSN`                 | Sentry 错误监控                |
| `APP_CDN_URL`                    | 静态资源 CDN                   |

### 构建分包

`vite.config.ts` 的 `rollupOptions.output.manualChunks` 对 `node_modules`
按依赖来源拆包，分离
`chunk-icons`（图标库）、`vue-vendor`、`axios-vendor`、`element-plus-vendor`、`dayjs-vendor`
与通用 `vendor`，配合 `cssCodeSplit` 与 terser 压缩（构建期 `drop_console` /
`drop_debugger`）优化产物体积。

Vite 插件链（`vite/plugins/index.ts`）按需启用：`vue`、`auto-import`、`svg-icon`、`components`、`mock`、`setup-extend`，构建期额外加入
`compression`（gzip/brotli）与 `visualizer`（产物分析）。

---

## 运行时配置（Runtime Config）

`src/utils/runtime-config.ts` 实现了一个**非响应式**的运行时配置单例
`runtimeConfig`：

- 数据在应用启动时通过 `getRuntimeConfig()`
  拉取一次（`initializeRuntime`），登录后不刷新。
- `set(raw)` 将后端返回的结构与 `DEFAULT_RUNTIME_CONFIG` 深合并，`ui` 字段会通过
  `normalizeUi` 去掉 `defaultXxx` 前缀（如 `defaultTheme` → `theme`）。
- 由于运行时配置在会话期间不变，**刻意不放入 reactive
  store**，组件 / 工具函数直接 `runtimeConfig.get()`
  读取即可，避免不必要的响应式开销。

配置覆盖优先级为：`DEFAULT_RUNTIME_CONFIG < 后端 runtime < 持久化 store < 用户偏好`，`initializeRuntime`
中 `settingStore.$patch({ ...runtimeDefaults, ...settingStore.$state })`
即落实此优先级。

---

## 架构风险与制约因素

- **动态路由当前硬编码**：`dynamicRoutes` 在 `src/router/index.ts`
  中以静态数组声明，仅按 `meta.permissions` 过滤。后续计划改造为从后端
  `queryMenus` 接口返回的菜单数据动态转换生成（`router/utils.ts` 中预留
  `buildRoutesFromMenus` 函数位置）。
- **Pinia store 拆分粒度**：当前仅 `setting` / `auth` / `dict`
  三个全局 store，大型业务状态交互需配合合理的 store 拆分与组合式函数（`composables/`）下沉。
- **请求层可升级性**：`@gvray/request`
  封装已覆盖拦截器、错误抛出与处理、Token 自动刷新（`requestAuthRefresh`
  preset），后续可按需引入请求缓存或重试机制。
- **持久化字段白名单**：`useSettingStore.persist.paths` 需与 `UserSettings`
  字段保持同步，新增偏好若未加入 `paths` 将不会被持久化。
- **主题变量注入为运行时**：主色 CSS 变量通过 `useThemeEffect` 动态注入
  `<style>` 标签，首屏渲染前需确保 `settingStore.colorPrimary` 已就绪（由
  `initializeRuntime` 阻塞挂载保证）。
