# 开发指南（Developer Guide）

本文档面向项目开发者，涵盖环境搭建、目录结构、开发规范、常用命令与扩展机制，帮助你快速上手并高效参与
**gvray-vue** 项目的开发。

> gvray-vue 是 [gvray-react](https://github.com/gvray/gvray-react)（React +
> Umi）的 Vue3 重写版本，技术栈为 **Vue3 + Vite + Pinia + Element Plus +
> TypeScript**。

---

## 1. 环境准备

### 1.1 必备工具

| 工具    | 版本要求                  | 说明                                |
| ------- | ------------------------- | ----------------------------------- |
| Node.js | `^20.19.0` 或 `>=22.12.0` | 见 `package.json` 中 `engines` 字段 |
| pnpm    | 最新版                    | 推荐通过 `corepack enable` 启用     |
| IDE     | -                         | 推荐 Cursor / VSCode                |
| 浏览器  | 现代浏览器                | Chrome / Firefox / Safari 最新版    |

> 💡 项目使用 pnpm，**禁止混用 npm / yarn** 安装依赖，否则可能导致 lock 不一致。

### 1.2 推荐 VSCode 插件

- ESLint
- Prettier - Code formatter
- Vue - Official（Volar）
- TypeScript Vue Plugin
- Element Plus Snippets
- Iconify IntelliSense

### 1.3 克隆与安装

```bash
git clone https://github.com/gvray/gvray-vue.git
cd gvray-vue
pnpm install
```

> 安装完成后 `prepare` 脚本会自动执行 `husky install`，配置 Git
> pre-commit 钩子。

---

## 2. 环境变量与多环境配置

### 2.1 环境文件

项目根目录下按环境维护 `.env` 文件：

| 文件           | 环境 | 启动命令           | 端口 | 说明                       |
| -------------- | ---- | ------------------ | ---- | -------------------------- |
| `.env.dev`     | 开发 | `pnpm dev`         | 9527 | 默认开启 Mock              |
| `.env.staging` | 测试 | `pnpm dev:staging` | 9528 | 连接后端 gvray-admin       |
| `.env.prod`    | 生产 | `pnpm dev:prod`    | 9529 | 生产环境配置预览           |
| `.env.example` | 模板 | -                  | -    | 环境变量模板，用于缺失检查 |

### 2.2 环境变量说明

| 变量名                   | 类型   | 说明                                      |
| ------------------------ | ------ | ----------------------------------------- |
| `APP_ENV`                | string | 当前环境标识：dev / staging / prod        |
| `APP_API_URL`            | string | API 请求前缀，如 `/api`                   |
| `APP_API_ORIGIN`         | string | 后端服务地址（`gen:api` 拉取 OpenAPI 用） |
| `APP_API_TOKEN_KEY`      | string | Token 存储 key                            |
| `APP_API_TIMEOUT`        | number | 请求超时时间（ms）                        |
| `APP_MOCK_ENABLED`       | string | 是否启用 Mock（`true` / `false`）         |
| `APP_VERSION`            | string | 应用版本号                                |
| `APP_BUILD_TIME`         | string | 构建时间                                  |
| `APP_CDN_URL`            | string | CDN 地址（可选）                          |
| `APP_SENTRY_DSN`         | string | Sentry DSN（可选）                        |
| `APP_TRACKING_ID`        | string | 统计追踪 ID（可选）                       |
| `APP_DEFAULT_LANGUAGE`   | string | 默认语言，如 `zh-CN`                      |
| `APP_DEFAULT_AVATAR_URL` | string | 默认头像 URL（兜底）                      |

### 2.3 加载机制

环境变量通过 Vite 原生 `loadEnv` 加载，并在 `vite.config.ts` 的
`buildAppDefines()` 中处理：

1. 根据 `--mode` 参数读取对应 `.env.{mode}` 文件
2. 凡 `APP_` 开头的变量被注入为全局常量 `__APP_<NAME>__`（如 `__APP_API_URL__`）
3. `scripts/load-env.ts` 提供 `loadEnvFromEnv()`，供 `gen:api`
   等独立脚本在 Node 环境复用，启动时会打印环境变量表格，并与 `.env.example`
   对比检查缺失项

---

## 3. 常用命令

以下命令均来自 `package.json` 的 `scripts` 字段，请勿编造其他命令。

### 3.1 开发

```bash
pnpm dev            # 开发环境，端口 9527（内置 Mock）
pnpm dev:staging    # 测试环境，端口 9528（连接后端）
pnpm dev:prod       # 生产环境配置预览，端口 9529
```

底层调用 `vite --mode <env> --port <port>`，`--mode` 决定加载哪个
`.env.{mode}`。

### 3.2 构建

```bash
pnpm build          # 构建所有环境（dev + staging + prod）
pnpm build:dev      # 仅构建 dev
pnpm build:staging  # 仅构建 staging
pnpm build:prod     # 仅构建 prod
pnpm preview        # 预览构建产物
```

产物输出到 `dist/` 目录。生产构建使用 terser 压缩，并自动 `drop_console` /
`drop_debugger`。

### 3.3 代码质量

```bash
pnpm lint           # 运行 ESLint 检查
pnpm lint:fix       # ESLint 检查并自动修复
pnpm format         # Prettier 格式化 JSON / Markdown / YAML 文件
```

### 3.4 API 类型生成

```bash
pnpm gen:api        # 从后端 OpenAPI 文档生成 TypeScript 类型
```

支持参数（直接传给 `tsx scripts/gen-api-types.ts`）：

- `--mode`：环境名称，默认 `dev`，决定读取哪个 `.env.{mode}`
- `--output`：输出文件路径，默认 `src/types/api.d.ts`

详见 [第 7 节：API 接口与 OpenAPI 同步](#7-api-接口与-openapi-同步)。

### 3.5 其他

```bash
pnpm update-gvray   # 批量升级所有 @gvray/* 依赖到最新版
```

---

## 4. 目录结构

```
gvray-vue/
├── docs/                      # 项目文档
├── mock/                      # Mock 数据（vite-plugin-mock）
│   ├── auth.ts                # 登录鉴权
│   ├── dashboard.ts           # 仪表盘
│   ├── dictionary.ts          # 字典
│   └── notice.ts              # 通知公告
├── public/                    # 静态资源
├── scripts/                   # 工具脚本
│   ├── gen-api-types.ts       # OpenAPI → TypeScript 类型生成器
│   └── load-env.ts            # 环境变量加载器（供脚本复用）
├── src/
│   ├── App.vue                # 根组件
│   ├── main.ts                # 应用入口（初始化运行时配置 / 鉴权 / 路由 / 字典）
│   ├── permission.ts          # 路由守卫（未登录拦截）
│   ├── request.ts             # @gvray/request 网络客户端初始化
│   ├── httpConfig.ts          # 请求/响应拦截器与错误处理
│   ├── api/                   # API 服务层（按业务模块组织）
│   ├── assets/                # 静态资源与全局样式
│   ├── components/            # 全局公共组件（TablePro / PageContainer / StatusTag 等）
│   ├── composables/           # 组合式函数（useDict / useTablePage 等）
│   ├── constants/             # 全局常量
│   ├── directive/             # 自定义指令（permission: v-hasPermi / v-hasRole）
│   ├── layout/                # 布局组件（Header + Sider + Content）
│   ├── locales/               # 国际化资源（zh-CN / en-US）
│   ├── router/                # 路由配置与动态路由工具
│   ├── stores/                # Pinia 状态管理（auth / dict / setting）
│   ├── types/                 # TypeScript 类型定义（含 gen:api 生成的 api.d.ts）
│   ├── utils/                 # 工具函数（token / logger / runtime-config 等）
│   ├── views/                 # 页面组件
│   └── vite-env.d.ts          # Vite 环境类型声明
├── vite/                      # Vite 插件配置
│   └── plugins/               # 插件集合（auto-import / components / mock / svg 等）
├── eslint.config.js           # ESLint Flat Config
├── prettier.config.js         # Prettier 配置
├── vite.config.ts             # Vite 主配置
└── package.json
```

---

## 5. 路由与新增页面

### 5.1 路由组织

路由定义在 `src/router/index.ts`，分为两类：

- **`constantRoutes`**：公共路由，无需鉴权即可访问（登录、注册、仪表板、403、404 等）
- **`dynamicRoutes`**：动态路由，基于用户权限过滤后注册（系统管理、监控等模块）

```ts
{
  path: '/system/user',
  component: () => import('@/views/system/user'),
  name: 'SystemUser',
  meta: {
    title: '用户管理',
    permissions: ['system:user:list'],
  },
}
```

- **`meta.title`**：页面标题，用于面包屑与文档标题
- **`meta.permissions`**：页面所需权限码，`router/utils.ts` 的
  `filterDynamicRoutes()` 会按权限过滤
- **`meta.auth`**：设为 `false` 表示不需要登录（如登录页）

### 5.2 动态路由注册

应用启动时，`main.ts` 调用 `addDynamicRoutes(dynamicRoutes, permissions)`：

1. `filterDynamicRoutes()` 递归过滤出当前用户有权限访问的路由
2. 超级管理员（`isSuperAdmin`）或拥有 `*:*:*` 权限码的用户可访问全部路由
3. `router.addRoute()` 动态注册，过程幂等（先移除再注册）

### 5.3 路由守卫

`src/permission.ts` 实现全局前置守卫：

1. 检查用户登录状态（Token 有效性）
2. 未登录且访问需鉴权页面 → 重定向到 `/login`
3. 已登录但动态路由未注册 → 触发初始化流程

### 5.4 新增页面流程

1. **创建页面组件**：在 `src/views/` 下新建目录和 `index.vue`
2. **注册路由**：在 `src/router/index.ts` 的 `constantRoutes` 或 `dynamicRoutes`
   中添加，设置 `meta.title` 与 `meta.permissions`
3. **添加 API 服务**：在 `src/api/` 中新建对应服务文件（详见
   [第 7 节](#7-api-接口与-openapi-同步)）
4. **添加 Mock**（可选）：在 `mock/` 中添加对应 Mock 数据（详见
   [第 8 节](#8-mock-数据)）
5. **使用 PageContainer**：页面根组件用 `<PageContainer>`
   包裹，自动获得标题与布局

```vue
<template>
  <PageContainer>
    <!-- 页面内容 -->
  </PageContainer>
</template>

<script setup lang="ts">
import { PageContainer } from '@/components/PageContainer'
</script>
```

---

## 6. 状态管理

项目使用 **Pinia** 作为状态管理方案，Store 位于 `src/stores/`：

| Store             | 文件         | 职责                                             |
| ----------------- | ------------ | ------------------------------------------------ |
| `useAuthStore`    | `auth.ts`    | 用户信息、权限码、角色、Token 状态               |
| `useDictStore`    | `dict.ts`    | 字典缓存（按 typeCode 缓存字典项）               |
| `useSettingStore` | `setting.ts` | 全局设置（主题、侧边栏、分页大小等，支持持久化） |

通过 `pinia-plugin-persistedstate` 实现状态持久化，`src/stores/index.ts`
统一导出。

---

## 7. API 接口与 OpenAPI 同步

### 7.1 服务层组织

`src/api/` 按业务模块组织 API 调用，统一使用 `@gvray/request` 的 `request`
方法：

| 文件            | 模块     | 文件              | 模块     |
| --------------- | -------- | ----------------- | -------- |
| `auth.ts`       | 登录鉴权 | `menu.ts`         | 菜单管理 |
| `user.ts`       | 用户管理 | `notice.ts`       | 通知公告 |
| `role.ts`       | 角色管理 | `permission.ts`   | 权限管理 |
| `department.ts` | 部门管理 | `position.ts`     | 岗位管理 |
| `dictionary.ts` | 字典管理 | `config.ts`       | 系统配置 |
| `dashboard.ts`  | 仪表盘   | `profile.ts`      | 个人资料 |
| `loginLog.ts`   | 登录日志 | `operationLog.ts` | 操作日志 |
| `onlineUser.ts` | 在线用户 | `cacheMonitor.ts` | 缓存监控 |
| `monitor.ts`    | 服务监控 | `system.ts`       | 系统配置 |

### 7.2 新增 API 接口

参照 `src/api/user.ts` 的写法：

```ts
import { request } from '@gvray/request'

/** 获取用户列表 */
export function queryUserList(params?: API.UsersFindAllParams) {
  return request<API.Response<API.PaginatedResponse<API.UserResponseDto>>>(
    '/system/users',
    { method: 'GET', params },
  )
}

/** 创建用户 */
export function createUser(data: API.CreateUserDto) {
  return request<API.Response<API.UserResponseDto>>('/system/users', {
    method: 'POST',
    data,
  })
}
```

命名约定遵循 REST 风格：`queryXxxList` / `getXxxById` / `createXxx` /
`updateXxx` / `deleteXxx`。

### 7.3 OpenAPI 类型同步（`pnpm gen:api`）

执行 `pnpm gen:api` 会从后端 OpenAPI 文档生成 `src/types/api.d.ts`，包含：

- 所有 `components.schemas` → TypeScript interface
- 所有接口的 Query 参数类型（`*QueryParams`）
- 通用类型：`API.Response<T>`、`API.PaginatedResponse<T>`

流程（`scripts/gen-api-types.ts`）：

1. 通过 `--mode` 读取 `.env.{mode}`，取 `APP_API_ORIGIN`
2. 请求 `${APP_API_ORIGIN}/api-json` 获取 OpenAPI JSON
3. 递归解析 `$ref` / `allOf` / `oneOf` / `anyOf` / `enum` / `array` / `object`
4. 写入 `src/types/api.d.ts`（文件头注明「请勿手动修改」）

```bash
pnpm gen:api                       # 默认 dev 环境
pnpm gen:api -- --mode staging     # 指定环境
pnpm gen:api -- --output src/types/api.d.ts  # 指定输出路径
```

> 后端服务需先启动，否则 `APP_API_ORIGIN` 不可达会报错。

---

## 8. Mock 数据

### 8.1 使用方式

Mock 文件位于 `mock/` 目录，基于 `vite-plugin-mock`，采用数组式定义：

```ts
export default [
  {
    url: '/api/auth/login',
    method: 'post',
    timeout: 1000,
    response({ body }: any) {
      const { password, account } = body
      if (password === '123456' && ['admin', 'super_admin'].includes(account)) {
        return {
          success: true,
          code: 200,
          message: '登录成功',
          data: { access_token: 'mock_access_token_admin' /* ... */ },
        }
      }
      return { success: false, code: 401, message: '用户名或密码错误' }
    },
  },
]
```

每个 Mock 项字段：

| 字段       | 类型     | 说明                                  |
| ---------- | -------- | ------------------------------------- |
| `url`      | string   | 接口路径                              |
| `method`   | string   | HTTP 方法（小写）                     |
| `timeout`  | number   | 模拟延迟（ms，可选）                  |
| `response` | function | 响应函数，接收 `{ query, body }` 参数 |

### 8.2 开关控制

- `.env.dev` 中 `APP_MOCK_ENABLED=true` 启用 Mock
- `.env.staging` / `.env.prod` 中 `APP_MOCK_ENABLED=false`
  关闭 Mock，连接真实后端
- Mock 文件修改后**自动热更新**，无需重启

### 8.3 覆盖范围

当前 Mock 覆盖：登录鉴权、仪表盘、字典、通知公告等模块。如需全量真实数据，请启动后端
[gvray-admin](https://github.com/gvray/gvray-admin)。

> ⚠️ Mock 运行在 Vite 处理层，可使用 `@/` 路径别名（与 React 版不同）。

---

## 9. 字典系统（useDict）

### 9.1 基本用法

`src/composables/useDict.ts` 提供字典一键加载能力，自动缓存到 `useDictStore`：

```ts
import { useDict } from '@/composables/useDict'

const dict = useDict(['user_status', 'common_status'])
// dict.user_status → API.DictionaryItemResponseDto[]
```

### 9.2 工作机制

1. 组件 `onMounted` 时，先从 `useDictStore` 读取已缓存的字典
2. 找出未缓存的 `typeCode`，批量调用
   `getDictionaryItemsByTypeCodes({ typeCodes })`
3. 接口返回后写入 `dictStore` 并更新响应式对象
4. 已缓存的字典不会重复请求

### 9.3 在模板中使用

```vue
<el-option
  v-for="item in dict.user_status"
  :key="item.value"
  :label="item.label"
  :value="item.value"
/>
```

---

## 10. TablePro + useTablePage

### 10.1 TablePro 组件

`src/components/TablePro/index.vue`
是增强表格容器，内置搜索区、工具栏、表格区、分页区：

```vue
<TablePro
  v-model:page="page"
  v-model:page-size="pageSize"
  :total="total"
  @page-change="handlePageChange"
  @size-change="handleSizeChange"
>
  <template #search>
    <!-- 搜索表单 -->
  </template>
  <template #toolbar>
    <!-- 操作按钮 -->
  </template>
  <!-- 默认插槽：表格主体 -->
  <el-table :data="list" v-loading="loading">
    <!-- el-table-column -->
  </el-table>
</TablePro>
```

| 插槽      | 说明                     |
| --------- | ------------------------ |
| `search`  | 搜索表单区               |
| `toolbar` | 工具栏（新增、批量操作） |
| 默认插槽  | 表格主体                 |

| Props / 事件        | 说明                 |
| ------------------- | -------------------- |
| `v-model:page`      | 当前页码（双向绑定） |
| `v-model:page-size` | 每页条数（双向绑定） |
| `:total`            | 数据总数             |
| `@page-change`      | 页码变化事件         |
| `@size-change`      | 每页条数变化事件     |

### 10.2 useTablePage 组合式函数

`src/composables/useTablePage.ts` 封装分页列表的通用逻辑：

```ts
import { useTablePage } from '@/composables/useTablePage'
import { queryUserList } from '@/api/user'

const {
  loading,
  list,
  total,
  page,
  pageSize,
  fetchList,
  reload,
  handleSearch,
  handleReset,
  handlePageChange,
  handleSizeChange,
} = useTablePage(queryUserList)
```

| 返回值                        | 说明                                     |
| ----------------------------- | ---------------------------------------- |
| `loading`                     | 加载状态                                 |
| `list`                        | 数据列表                                 |
| `total` / `page` / `pageSize` | 总数 / 当前页 / 每页条数                 |
| `fetchList(params)`           | 请求列表（缓存最近一次参数，供翻页复用） |
| `reload()`                    | 用同一批参数重新加载当前页               |
| `handleSearch(params)`        | 搜索：重置到第一页再请求                 |
| `handleReset()`               | 重置：清空参数，回到第一页               |
| `handlePageChange(p)`         | 切换页码                                 |
| `handleSizeChange(size)`      | 切换每页条数（同步到全局设置）           |

- `pageSize` 初始值取自 `useSettingStore().pageSize`
- `handleSizeChange` 会调用 `settingStore.setPageSize()` 持久化用户偏好
- `immediate` 选项（默认 `true`）控制是否在 `onMounted` 时立即请求

### 10.3 完整示例

```vue
<template>
  <PageContainer>
    <TablePro
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="total"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    >
      <template #search>
        <el-form @submit.prevent="() => handleSearch(searchParams)">
          <el-input v-model="searchParams.username" />
          <el-button type="primary" @click="() => handleSearch(searchParams)"
            >搜索</el-button
          >
        </el-form>
      </template>
      <el-table :data="list" v-loading="loading">
        <el-table-column prop="username" label="账号" />
      </el-table>
    </TablePro>
  </PageContainer>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { PageContainer } from '@/components/PageContainer'
import TablePro from '@/components/TablePro'
import { useTablePage } from '@/composables/useTablePage'
import { queryUserList } from '@/api/user'

const searchParams = reactive({ username: '' })
const {
  loading,
  list,
  total,
  page,
  pageSize,
  handleSearch,
  handleReset,
  handlePageChange,
  handleSizeChange,
} = useTablePage(queryUserList)
</script>
```

---

## 11. 权限指令（v-hasPermi / v-hasRole）

### 11.1 注册

`src/directive/permission/index.ts` 暴露 `setupPermissionDirectives(app)`，在
`main.ts` 中注册到 Vue 实例：

```ts
import { setupPermissionDirectives } from '@/directive/permission'

const app = createApp(App)
setupPermissionDirectives(app) // 注册 v-hasPermi / v-hasRole
```

### 11.2 v-hasPermi：按钮权限

`v-hasPermi` 检查当前用户是否拥有**全部**指定权限码：

```vue
<el-button
  v-hasPermi="'system:user:create'"
  @click="handleCreate"
>新增</el-button>
<el-button
  v-hasPermi="['system:user:update', 'system:user:reset-password']"
>重置密码</el-button>
```

逻辑（`src/directive/permission/hasPermi.ts`）：

1. 超级管理员（`isSuperAdmin`）直接放行
2. 拥有 `*:*:*` 权限码直接放行
3. 否则要求 `perms.every(p => permissions.includes(p))` 全部满足
4. 不满足则从 DOM 移除该元素

### 11.3 v-hasRole：角色权限

`v-hasRole` 检查当前用户是否拥有**任一**指定角色 key：

```vue
<el-button v-hasRole="'super_admin'">仅超管可见</el-button>
<el-button v-hasRole="['admin', 'super_admin']">管理员可见</el-button>
```

逻辑（`src/directive/permission/hasRole.ts`）：

1. 超级管理员直接放行
2. 否则要求 `roles.some(r => userRoleKeys.includes(r))` 任一满足
3. 不满足则从 DOM 移除

> 指令在 `mounted` 钩子执行，通过 `el.parentNode.removeChild(el)`
> 移除元素。如需更细粒度的控制，可改用 `v-if` 配合
> `useAuthStore().permissions`。

---

## 12. 网络请求

### 12.1 请求客户端

基于 `@gvray/request`（Axios 封装）初始化，配置在
`src/request.ts`，拦截器与错误处理在 `src/httpConfig.ts`：

- `baseURL`：由 `__APP_API_URL__` 全局常量控制
- `timeout`：由 `__APP_API_TIMEOUT__` 控制
- 请求拦截器：注入 Token 等
- 响应拦截器：业务级 `success === false` 处理
- 错误处理：401 弹窗/跳转登录，其他错误按 `ErrorShowType` 分发（`ElMessage` /
  `ElNotification`）

### 12.2 跳过错误处理

调用时传入 `skipErrorHandler` 选项可跳过全局错误处理：

```ts
queryMe({ skipErrorHandler: true }).catch(() => undefined)
```

---

## 13. 国际化

国际化资源位于 `src/locales/`：

```
src/locales/
├── index.ts       # vue-i18n 实例
├── zh-CN.ts       # 中文入口
├── zh-CN/         # 中文子模块
├── en-US.ts       # 英文入口
└── en-US/         # 英文子模块
```

基于 **vue-i18n** 实现，默认语言 `zh-CN`（由 `APP_DEFAULT_LANGUAGE`
控制）。组件中使用：

```ts
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
```

```vue
<template>
  <span>{{ t('menu.system.user') }}</span>
</template>
```

---

## 14. 代码规范（ESLint / Prettier / Husky / lint-staged）

### 14.1 ESLint

采用 **Flat Config**（`eslint.config.js`），集成：

- `@eslint/js` + `typescript-eslint`：JS/TS 推荐规则
- `eslint-plugin-vue`：Vue 推荐规则
- `@stylistic/eslint-plugin`：代码风格（2 空格缩进、单引号、无分号）
- `eslint-plugin-prettier/recommended`：Prettier 集成

`no-console` 为 `warn`，生产构建会被 terser `drop_console` 移除。

### 14.2 Prettier

配置在 `prettier.config.js`，关键项：

| 选项            | 值      |
| --------------- | ------- |
| `singleQuote`   | `true`  |
| `semi`          | `false` |
| `printWidth`    | `80`    |
| `tabWidth`      | `2`     |
| `trailingComma` | `'all'` |
| `endOfLine`     | `'lf'`  |

```bash
pnpm format    # 格式化 JSON / Markdown / YAML
```

> Vue / JS / TS 文件的格式化由 ESLint（集成 Prettier）负责，通过 `pnpm lint:fix`
> 修复。

### 14.3 Husky + lint-staged

- `pnpm prepare`（`husky install`）安装 Git 钩子
- `.husky/pre-commit` 执行 `npx lint-staged`
- `lint-staged` 配置（`package.json`）：

```json
{
  "*.{js,jsx,ts,tsx,vue}": ["eslint --fix"],
  "*.{scss,css,html,json,md,yml}": ["prettier --write"]
}
```

提交时自动修复暂存区文件的 lint 与格式问题，**未通过则阻止提交**。

### 14.4 命名规范

| 层             | 作用                    | 命名示例                                            |
| -------------- | ----------------------- | --------------------------------------------------- |
| **API**        | 调用后端 API，REST 风格 | `queryUserList` / `createUser` / `updateUser`       |
| **Store**      | 管理前端状态、业务逻辑  | `setAuth` / `setDict` / `setPageSize`               |
| **Composable** | 组合式逻辑封装          | `useDict` / `useTablePage`                          |
| **UI 事件**    | 页面事件触发            | `handleSearch` / `handleReset` / `handlePageChange` |

---

## 15. 调试技巧

- **环境变量检查**：`gen:api` 与脚本运行时会打印环境变量表格，确认配置正确
- **Mock 调试**：Mock 文件修改后自动热更新，无需重启
- **TypeScript 检查**：`npx vue-tsc --noEmit` 快速检查类型错误
- **Bundle 分析**：`vite.config.ts` 已集成
  `rollup-plugin-visualizer`，构建产物包含可视化报告
- **网络请求**：所有请求错误通过 `src/httpConfig.ts` 统一处理并弹出提示
- **Vue DevTools**：推荐安装 Vue.js DevTools 浏览器扩展

---

## 16. 注意事项

- **环境变量必须以 `APP_` 开头**：非 `APP_` 前缀的变量不会被注入为 `__APP_*__`
  全局常量
- **`gen:api` 需后端可达**：`APP_API_ORIGIN`
  不可达会报错，执行前确认后端服务已启动
- **`src/types/api.d.ts` 勿手动修改**：该文件由 `pnpm gen:api`
  自动生成，手改会被覆盖
- **pnpm 严格模式**：项目使用 pnpm，不要混用 npm / yarn 安装依赖
- **Node.js 版本**：确保使用 Node.js `^20.19.0` 或
  `>=22.12.0`，低版本会导致构建脚本异常
- **动态路由硬编码**：当前 `dynamicRoutes`
  为硬编码配置，后续计划改为从后端菜单数据动态转换

---

## 17. 分支管理

- `feature/*` → 每个新功能或 bug 修复
- `develop` → 测试环境，集成所有 feature
- `release/*` → 准备发版，冻结功能，做最终测试
- `main` → 生产环境，始终稳定
- `hotfix/*` → 紧急修复生产环境 bug
