import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** false 表示该页面免主题（固定 light，不应用 dark/色弱/灰阶），如 login/register */
    theme?: boolean
  }
}
