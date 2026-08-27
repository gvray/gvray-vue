# 主题系统使用规范

> 规范版本：v1.0 | 最后更新：2026-08-26 | 适用项目：gvray-vue（Vue3 + Vite +
> Pinia + Element Plus + TypeScript）

## 一、核心原则

```
单一来源：Pinia Store (useSettingStore) → useThemeEffect → <html class> + :root CSS 变量
统一通道：所有自定义样式必须通过 CSS 变量消费主题色
禁止硬编码：任何颜色值必须从 CSS 变量或 Element Plus token 来，禁止写死 #xxx
```

与 React 版（antd ConfigProvider +
cssinjs）不同，Vue 版主题不依赖运行时 JS 上下文，而是通过 **CSS 变量 + `<html>`
class** 驱动，Element Plus 自身的 light/dark 切换由
`element-plus/theme-chalk/dark/css-vars.css`
提供，gvray 在其之上叠加语义别名层。

## 二、技术栈角色分工

| 技术                  | 职责                  | 颜色消费方式                                                               |
| --------------------- | --------------------- | -------------------------------------------------------------------------- |
| **Element Plus**      | UI 组件库             | `--el-*` 原生变量，light/dark 由 `dark/css-vars.css` 自动切换              |
| **SCSS**              | 页面级样式 / 全局变量 | 只写结构，颜色全部用 `var(--gvray-color-xxx)`                              |
| **Vue SFC `<style>`** | 组件级样式            | 直接用 `var(--gvray-color-xxx)`，动态值用 `v-bind()`                       |
| **ECharts**           | 图表                  | 读取 `getComputedStyle(document.documentElement)` 获取 CSS 变量注入 option |
| **TS inline style**   | 极少数场景            | 用 `var(--gvray-color-xxx)`                                                |
| **Pinia store**       | 主题状态来源          | `useSettingStore` 持久化 + `useThemeEffect` 派发副作用                     |

## 三、使用规范（按场景）

### 3.1 SCSS / Vue SFC `<style>` → 全部用 CSS 变量

```scss
/* ✅ 正确 */
.my-card {
  color: var(--gvray-color-text);
  background: var(--gvray-color-bg-container);
  border: 1px solid var(--gvray-color-border);

  &:hover {
    background: var(--gvray-color-primary-bg);
    border-color: var(--gvray-color-primary-border);
  }
}
```

```scss
/* ❌ 错误 */
.my-card {
  color: #666; // 硬编码
  background: #fff;
  border: 1px solid #d9d9d9;
}
```

**重要**：不要通过 SCSS 变量包装 CSS 变量。SCSS 编译期无法追踪 CSS 变量运行时变化，且会丢失 dark 模式自动跟随能力。

```scss
/* ❌ 错误 - SCSS 编译期把 CSS 变量当成静态字符串 */
$primary: var(--gvray-color-primary);
.button {
  color: $primary;
}

/* ✅ 正确 - 直接使用 */
.button {
  color: var(--gvray-color-primary);
}
```

### 3.2 Vue SFC 动态值 → `v-bind()` 绑定 store

当颜色需要跟随用户选择的主色（`colorPrimary`）动态变化时，使用 Vue 3 的 CSS
`v-bind()`：

```vue
<!-- ✅ 正确：sidebar-menu 的 active 色跟随 colorPrimary -->
<style lang="scss" scoped>
.sidebar-menu {
  --el-menu-bg-color: var(--gvray-sider-menu-bg);
  --el-menu-text-color: var(--gvray-sider-menu-text);
  --el-menu-active-color: v-bind('settingStore.colorPrimary');
}
</style>
```

```vue
<!-- ❌ 错误：硬编码颜色或用 JS 拼字符串 -->
<style scoped>
.bad {
  color: v-bind("'#' + settingStore.colorPrimary.slice(1)");
}
</style>
```

**注意**：`v-bind()` 中只读取 store 字段或 computed，不要写复杂表达式；Element
Plus 的 `--el-*` 局部覆盖写在组件 `<style>` 里即可生效。

### 3.3 TS inline style → CSS 变量

```vue
<!-- ✅ 正确 -->
<span :style="{ color: 'var(--gvray-color-primary)' }" />

<!-- ❌ 错误 -->
<span :style="{ color: '#1890ff' }" />
```

### 3.4 ECharts / Canvas → 读取 CSS 变量

Vue 版没有 `theme.useToken()`，需从 `<html>` 读取计算后的 CSS 变量：

```ts
// ✅ 正确：在组件 setup 中读取一次，主题切换时由 watch 触发重绘
function readToken(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
}

const option = {
  xAxis: {
    axisLabel: { color: readToken('--gvray-color-text-secondary') },
  },
  yAxis: {
    splitLine: { lineStyle: { color: readToken('--gvray-color-border') } },
  },
  tooltip: {
    backgroundColor: readToken('--gvray-color-bg-container'),
    borderColor: readToken('--gvray-color-border'),
    textStyle: { color: readToken('--gvray-color-text') },
  },
  // 数据系列颜色保留，用于区分数据
  series: [{ data: [...], itemStyle: { color: '#667eea' } }],
}
```

主题切换时，监听 `settingStore.resolvedTheme` 或 `colorPrimary`
重新读取并 setOption。

### 3.5 颜色消费方式汇总

| 场景                      | 推荐方式                                        |
| ------------------------- | ----------------------------------------------- |
| SCSS / SFC `<style>`      | `var(--gvray-color-xxx)`                        |
| SFC 动态主色              | `v-bind('settingStore.colorPrimary')`           |
| Element Plus 组件局部覆盖 | `--el-menu-xxx` 等局部变量（写在 scoped style） |
| ECharts / Canvas          | `getComputedStyle` 读取 `--gvray-color-xxx`     |
| TS inline style           | `var(--gvray-color-xxx)`                        |

不要自定义 composable 封装颜色常量，CSS 变量已覆盖所有场景。

## 四、CSS 变量命名规范与分层

### 4.1 命名规则

```
--gvray-{类别}-{语义}[-{状态}]
```

与 Element Plus 的 `--el-*` 保持一致风格，便于对照。所有 gvray 自有变量前缀为
`--gvray-`，绝不直接在业务代码中消费 `--el-*`（除组件局部覆盖场景，见 3.2）。

### 4.2 变量分层

`src/assets/styles/variables.scss` 定义三层：

| 层级                 | 说明                                                                                         | 示例                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **主色色阶**         | `--gvray-color-primary-*`，由 `useThemeEffect` 动态注入覆盖，`variables.scss` 只放兜底默认值 | `--gvray-color-primary`、`--gvray-color-primary-hover`、`--gvray-color-primary-1..7` |
| **语义别名层**       | `--gvray-color-*` 引用 El Plus 的 `--el-*`，light/dark 切换自动跟随                          | `--gvray-color-text` → `var(--el-text-color-primary)`                                |
| **gvray 独有 token** | El Plus 没有对应物的变量，静态默认值                                                         | `--gvray-border-radius`、`--gvray-sider-bg`                                          |

完整变量定义见 `src/assets/styles/variables.scss`。

### 4.3 侧边栏专用变量

侧边栏主题（`sidebarTheme: 'light' | 'dark'`）独立于全局 light/dark 模式，通过
`.sidebar.is-dark` class 切换：

```scss
// variables.scss
html.dark .sidebar:not(.is-dark) {
  // 全局 dark 模式下，light 侧边栏自动跟随变暗
  --gvray-sider-bg: #141414;
  // ...
}

.sidebar.is-dark {
  // 侧边栏 dark 主题（与全局模式无关）
  --gvray-sider-bg: #001529;
  // ...
}
```

`SideBar.vue` 通过
`:class="{ 'is-dark': settingStore.sidebarTheme === 'dark' }"` 切换。

## 五、常见颜色替换对照

| 硬编码值                             | 替换为                                                   |
| ------------------------------------ | -------------------------------------------------------- |
| `#fff`, `#ffffff`                    | `var(--gvray-color-bg-container)`                        |
| `#000`, `#000000`                    | `var(--gvray-color-text)`                                |
| `#666`, `#888`                       | `var(--gvray-color-text-secondary)`                      |
| `#999`, `#bfbfbf`, `#8c8c8c`, `#bbb` | `var(--gvray-color-text-placeholder)`                    |
| `#d9d9d9`                            | `var(--gvray-color-border)`                              |
| `#f0f0f0`, `#f5f5f5`                 | `var(--gvray-color-border)` 或 `var(--gvray-color-fill)` |
| `#fafafa`                            | `var(--gvray-color-bg-elevated)`                         |
| `#e6e6e6`                            | `var(--gvray-color-fill)`                                |
| `#1890ff`                            | `var(--gvray-color-primary)`                             |
| `#1677ff`                            | `var(--gvray-color-primary)`                             |
| `#52c41a`                            | `var(--gvray-color-success)`                             |
| `#faad14`                            | `var(--gvray-color-warning)`                             |
| `#ff4d4f`                            | `var(--gvray-color-error)`                               |
| `#722ed1`                            | `var(--gvray-color-info)`                                |
| `rgba(0,0,0,0.45)`                   | `var(--gvray-color-text-secondary)`                      |
| `rgba(0,0,0,0.25)`                   | `var(--gvray-color-text-placeholder)`                    |
| `rgba(0,0,0,0.06)`                   | `var(--gvray-color-fill)`                                |
| `rgba(255,255,255,0.75)`             | `var(--gvray-color-bg-mask)`                             |

## 六、主题切换机制（useThemeEffect）

`src/composables/useThemeEffect.ts` 是主题系统的唯一副作用入口，**仅在 `App.vue`
根组件调用一次**，负责四件事：

### 6.1 OS 主题监听

```ts
onMounted(() => {
  store.systemTheme = getSystemTheme() // 初始同步
  startSystemThemeWatcher((mode) => {
    store.systemTheme = mode // 后续变化写入 store
  })
})
```

`src/utils/theme.ts` 通过 `window.matchMedia('(prefers-color-scheme: dark)')`
监听系统主题，**`systemTheme` 不持久化**，只作为 `resolvedTheme` 的输入。

### 6.2 dark / light class

```ts
watch(
  () => store.resolvedTheme,
  (theme) => {
    html.classList.toggle('dark', theme === 'dark')
  },
  { immediate: true },
)
```

`resolvedTheme`
getter 在 store 中定义：`theme === 'system' ? systemTheme : theme`。`<html class="dark">`
触发 Element Plus 的 `dark/css-vars.css` 中所有 `html.dark { --el-* }`
规则，语义别名层自动跟随。

### 6.3 辅助功能 class

```ts
watch(
  () => store.colorWeak,
  (v) => document.body.classList.toggle('color-weak', v),
)
watch(
  () => store.grayMode,
  (v) => document.body.classList.toggle('gray-mode', v),
)
```

`color-weak` → `filter: invert(80%)`，`gray-mode` →
`filter: grayscale(100%)`，定义在 `global.scss` 和 `App.vue`。

### 6.4 主色 CSS 变量注入

```ts
watch(
  () => store.colorPrimary,
  (color) => {
    const hover = lighten(color, 10)
    const active = darken(color, 10)
    const tokens = {
      '--el-color-primary': color,
      '--gvray-color-primary': color,
      '--gvray-color-primary-hover': hover,
      '--gvray-color-primary-active': active,
      '--gvray-color-primary-bg': lighten(color, 30),
      '--gvray-color-primary-border': lighten(color, 20),
      // ...色阶 1-7
    }
    // 写入 <style id="gvray-theme-vars">:root { ... }
  },
  { immediate: true },
)
```

使用 `@gvray/colorkit` 的 `lighten` / `darken` 派生色阶，同时覆盖
`--el-color-primary`（Element Plus 组件）和
`--gvray-color-primary-*`（业务样式）。`variables.scss`
中的默认值仅作兜底，运行时被此 style 标签覆盖。

## 七、Element Plus 主题适配方式

### 7.1 全局接入

`src/main.ts` 引入 Element Plus 的 light + dark CSS：

```ts
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
```

dark 模式由 `<html class="dark">` 触发，无需 JS 切换样式表。

### 7.2 ConfigProvider

`App.vue` 使用 `el-config-provider` 提供 `size` / `zIndex` /
`locale`，**不传递 theme/token**（Element Plus 无 antd 的 theme prop）：

```vue
<el-config-provider :size="size" :z-index="zIndex" :locale="elLocale">
  <router-view />
</el-config-provider>
```

主色覆盖通过 6.4 的 CSS 变量注入完成，而非 ConfigProvider。

### 7.3 组件局部覆盖

组件内部可在 scoped style 中覆盖 `--el-*` 局部变量，典型示例见
`src/layout/components/SideBar/SideBar.vue`：

```scss
.sidebar-menu {
  --el-menu-border-color: transparent;
  --el-menu-bg-color: var(--gvray-sider-menu-bg);
  --el-menu-text-color: var(--gvray-sider-menu-text);
  --el-menu-active-color: v-bind('settingStore.colorPrimary');
  --el-menu-hover-bg-color: var(--gvray-sider-bg-hover);
}
```

**约定**：组件局部覆盖 `--el-*` 时，右侧值必须来自 `--gvray-*` 语义变量或
`v-bind()` 动态值，不要写死颜色。

## 八、Store 持久化与初始化优先级

### 8.1 持久化配置

`src/stores/setting.ts` 使用 Pinia
persist 插件，`key: 'app-settings'`，持久化路径：

```ts
persist: {
  key: 'app-settings',
  paths: [
    'theme', 'colorPrimary', 'language', 'pageSize', 'componentSize',
    'showBreadcrumb', 'sidebarCollapsed', 'sidebarTheme', 'showLogo',
    'fixedHeader', 'showFooter', 'colorWeak', 'grayMode',
    'uniqueOpened', 'enableNotification',
  ],
}
```

**`systemTheme` 不在 paths 中**，由 `useThemeEffect` 监听 `prefers-color-scheme`
实时写入。

### 8.2 初始化优先级

`src/main.ts` 的 `initializeRuntime()` 定义优先级：

```
runtime default (后端返回) < localStorage persisted < 用户偏好 (me.preferences)
```

```ts
settingStore.$patch({ ...runtimeDefaults, ...settingStore.$state })
// 登录后
useSettingStore().$patch({ ...(me.preferences || {}) })
```

`DEFAULT_RUNTIME_CONFIG.ui`（`src/constants/runtime-settings.ts`）提供兜底默认值：`theme: 'light'`、`colorPrimary: '#1890ff'`、`sidebarTheme: 'light'`
等。

### 8.3 Store API

| Action                                     | 作用                                |
| ------------------------------------------ | ----------------------------------- |
| `setTheme(mode: ThemeMode)`                | 设置主题模式（light/dark/system）   |
| `setColorPrimary(color)`                   | 设置主色                            |
| `toggleDarkMode()`                         | 在 light → dark → system 间循环切换 |
| `setSidebarTheme(theme: SiderTheme)`       | 设置侧边栏主题                      |
| `setColorWeak(bool)` / `setGrayMode(bool)` | 辅助功能开关                        |
| `patchSettings(patch)`                     | 批量更新                            |
| `reset()`                                  | 重置为默认配置                      |

## 九、颜色与命名约定

### 9.1 预设主色

`src/constants/theme.ts` 通过 `ColorPrimary`
类型限定 11 种预设色，禁止使用类型外的颜色：

```ts
export type ColorPrimary =
  | '#1677ff'
  | '#1890ff'
  | '#f5222d'
  | '#fa541c'
  | '#faad14'
  | '#a0d911'
  | '#52c41a'
  | '#13c2c2'
  | '#2f54eb'
  | '#722ed1'
  | '#eb2f96'
```

每种颜色对应国际化 key（`PRIMARY_COLOR_INTL_KEYS`），在 `ThemeSetting.vue`
的主题色选择面板中使用。

### 9.2 主题模式类型

```ts
export type ThemeMode = 'light' | 'dark' | 'system'
export type ThemeModeWithoutSystem = 'light' | 'dark'
export type SiderTheme = 'light' | 'dark'
```

`ThemeMode` 含 `system`（跟随系统），`resolvedTheme`
getter 将其解析为实际的 light/dark。

## 十、新增主题 / 变量规范

### 10.1 新增语义变量

若需要新的颜色语义（如 `--gvray-color-text-heading`），在
`src/assets/styles/variables.scss` 的 `:root` 块中添加，**优先引用 El
Plus 变量**：

```scss
:root {
  // ✅ 正确：引用 El Plus，light/dark 自动跟随
  --gvray-color-text-heading: var(--el-text-color-primary);

  // ❌ 错误：写死颜色，dark 模式不跟随
  --gvray-color-text-heading: #262626;
}
```

### 10.2 新增主色派生变量

若主色色阶需要新的派生色（如 `--gvray-color-primary-light-3`），在
`useThemeEffect.ts` 的 `tokens` 对象中添加，使用 `@gvray/colorkit` 的 `lighten`
/ `darken` 生成，**同时在 `variables.scss` 写兜底默认值**：

```ts
// useThemeEffect.ts
const tokens = {
  // ...
  '--gvray-color-primary-light-3': lighten(color, 30),
}
```

```scss
// variables.scss
:root {
  --gvray-color-primary-light-3: #e6f7ff; // 兜底，被 useThemeEffect 覆盖
}
```

### 10.3 新增侧边栏变量

侧边栏专用变量需同时覆盖三处：`:root`（light 默认）、`html.dark .sidebar:not(.is-dark)`（全局 dark +
light 侧边栏）、`.sidebar.is-dark`（dark 侧边栏），保证三种组合下都有值。

### 10.4 新增预设主色

1. 在 `ColorPrimary` 类型添加颜色值
2. 在 `PRIMARY_COLOR_INTL_KEYS` 添加对应国际化 key
3. 在 `src/locales/` 的 `theme.color.*` 添加翻译
4. `useThemeEffect` 会自动派生色阶，无需额外改动

## 十一、架构图

```
┌─────────────────────────────────────────────────────────────┐
│  Pinia Store (useSettingStore)                              │
│  theme | colorPrimary | sidebarTheme | colorWeak | grayMode │
│  persist → localStorage | 优先级: runtime < local < user   │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│  useThemeEffect (App.vue 调用一次)                           │
│  1. 监听 prefers-color-scheme → store.systemTheme            │
│  2. resolvedTheme → <html class="dark">                     │
│  3. colorWeak / grayMode → <body class>                     │
│  4. colorPrimary → <style id="gvray-theme-vars">:root       │
└────────────┬───────────┬───────────┬──────────────────────┘
             │           │           │
      ┌──────▼───────────┐ │           │
      │  Element Plus     │ │           │
      │  dark/css-vars    │ │           │
      │  --el-* 自动切换  │ │           │
      └───────────────────┘ │           │
                            │           │
      ┌─────────────────────▼─┐ ┌───────▼───────┐
      │  SCSS / SFC <style>   │ │  ECharts      │
      │  var(--gvray-*)       │ │  getComputed  │
      │  v-bind(store.xxx)    │ │  Style()      │
      └───────────────────────┘ └───────────────┘
```

## 十二、FAQ

**Q1: 为什么不用 Element
Plus 的 SCSS 主题变量定制（`@use "element-plus/theme-chalk/src/..."`）？**

A: 三个原因：

1. 全量 SCSS 定制需要重新编译 Element Plus，构建成本高
2. `useThemeEffect` 通过运行时注入 `--el-color-primary`
   等变量，可动态响应用户选择的主色，无需重新构建
3. 语义别名层（`--gvray-color-*` 引用 `--el-*`）已足够覆盖业务样式需求

**Q2: SCSS 中能不能用 CSS 变量做运算？**

A: 不能直接用 SCSS 运算，但可以用浏览器原生 `calc()`：

```scss
/* ❌ 错误 - SCSS 编译期无法处理 CSS 变量 */
width: var(--gvray-border-radius) * 2;

/* ✅ 正确 - calc 在浏览器运行期计算 */
width: calc(var(--gvray-border-radius) * 2);
```

**Q3: 切换主题时 CSS 变量怎么生效？**

A: 三条路径：

1. **light/dark 切换**：`useThemeEffect` 切换 `<html class="dark">` → Element
   Plus 的 `dark/css-vars.css` 重写所有 `--el-*` → `--gvray-color-*`
   别名自动跟随 → 浏览器重算所有 `var()`
2. **主色切换**：`useThemeEffect` 重写 `<style id="gvray-theme-vars">` 的
   `:root` 规则 → 浏览器重算
3. **Vue 组件不会重渲染**：样式规则不变，只是变量值变了（`v-bind()` 绑定的除外）

**Q4: 新组件怎么接入主题？**

A: 三步：

1. 写样式 → 用 `var(--gvray-color-xxx)` CSS 变量
2. 需要跟随主色动态变化 → `v-bind('settingStore.colorPrimary')`
3. 不要 → 写死任何 `#xxx` 颜色值

**Q5: 为什么 `systemTheme` 不持久化？**

A: 系统主题是环境状态，不是用户偏好。用户重启设备或改变系统主题时，`useThemeEffect`
会通过 `matchMedia` 监听器实时同步，持久化反而会导致与系统状态不一致。

**Q6: 渐变卡片为什么可以保留 `color: #fff`？**

A: 渐变卡片背景是深色渐变（`linear-gradient(135deg, ...)`），文字必须在任何主题下都是白色才可读。这是**装饰性硬编码**，不是主题色。`mixins.scss`
的 `gradient-primary` mixin 同理。

## 十三、检查清单（Code Review）

提交 PR 时检查：

- [ ] 没有 `#1890ff`、`#1677ff` 等主色硬编码
- [ ] 没有 `#fff` / `#ffffff` / `#000` 等极端色（除非装饰性场景，见 Q6）
- [ ] SCSS / SFC 中所有颜色使用 `var(--gvray-color-xxx)`
- [ ] 不通过 SCSS 变量包装 CSS 变量（`$x: var(--gvray-*)`）
- [ ] 动态主色用 `v-bind('settingStore.colorPrimary')`，不用 JS 拼字符串
- [ ] 组件局部覆盖 `--el-*` 时，右侧值来自 `--gvray-*` 或 `v-bind()`
- [ ] ECharts 通过 `getComputedStyle` 读取 CSS 变量
- [ ] 新增主色派生变量同时更新 `useThemeEffect.ts` 和 `variables.scss`
- [ ] 新增侧边栏变量覆盖
      `:root`、`html.dark .sidebar:not(.is-dark)`、`.sidebar.is-dark` 三处
- [ ] 新增/修改的组件在 light、dark 两种主题下测试通过
