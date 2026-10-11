import { useThemeTokens } from './useThemeTokens'
import { useThemeScope } from './useThemeScope'
import { useThemeMode } from './useThemeMode'

/**
 * 主题系统入口（仅在 App.vue 根调用一次）。
 * 三层：
 *  1. useThemeTokens —— 主色 token 注入，全程生效
 *  2. useThemeMode   —— 明暗/色弱/灰阶，路由作用域门控
 *  3. useThemeScope  —— 依据路由 meta.theme 抑制免主题页
 */
export function useTheme() {
  useThemeTokens()
  const { excluded } = useThemeScope()
  useThemeMode(excluded)
}
