import { watch, onMounted, onUnmounted } from 'vue'
import { lighten, darken } from '@gvray/colorkit'
import { useSettingStore } from '@/stores/setting'
import {
  startSystemThemeWatcher,
  stopSystemThemeWatcher,
  getSystemTheme,
} from '@/utils/theme'

/**
 * 主题全局副作用管理器。
 *
 * 职责：
 * 1. 监听 OS prefers-color-scheme 并同步到 store.systemTheme
 * 2. 将 resolvedTheme 映射为 <html class="dark|light">
 * 3. 将 colorPrimary 派生色阶注入 :root CSS 变量
 * 4. 将 colorWeak / grayMode 切换 body class
 *
 * 仅在 App.vue 根组件调用一次。
 */
export function useThemeEffect() {
  const store = useSettingStore()
  const html = document.documentElement

  // ── 1. OS 主题监听 ────────────────────────────────────────────
  onMounted(() => {
    // 立即同步当前系统主题（startSystemThemeWatcher 内部也会立即触发一次回调）
    store.systemTheme = getSystemTheme()
    startSystemThemeWatcher((mode) => {
      store.systemTheme = mode
    })
  })

  onUnmounted(() => {
    stopSystemThemeWatcher()
  })

  // ── 2. dark / light class ─────────────────────────────────────
  watch(
    () => store.resolvedTheme,
    (theme) => {
      html.classList.toggle('dark', theme === 'dark')
    },
    { immediate: true },
  )

  // ── 3. 辅助功能 class ─────────────────────────────────────────
  watch(
    () => store.colorWeak,
    (v) => document.body.classList.toggle('color-weak', v),
    { immediate: true },
  )

  watch(
    () => store.grayMode,
    (v) => document.body.classList.toggle('gray-mode', v),
    { immediate: true },
  )

  // ── 4. 主色 CSS 变量注入 ──────────────────────────────────────
  let styleEl: HTMLStyleElement | null = null

  watch(
    () => store.colorPrimary,
    (color) => {
      const hover = lighten(color, 10)
      const active = darken(color, 10)

      const tokens: Record<string, string> = {
        '--el-color-primary': color,
        '--gvray-primary-color': color,
        '--gvray-color-primary': color,
        '--gvray-primary-color-hover': hover,
        '--gvray-color-primary-hover': hover,
        '--gvray-primary-color-active': active,
        '--gvray-color-primary-active': active,
        '--gvray-primary-color-outline': `${color}33`,
        '--gvray-color-primary-bg': lighten(color, 30),
        '--gvray-color-primary-border': lighten(color, 20),
        '--gvray-color-primary-border-hover': lighten(color, 14),
        '--gvray-primary-1': lighten(color, 30),
        '--gvray-primary-2': lighten(color, 22),
        '--gvray-primary-3': lighten(color, 14),
        '--gvray-primary-4': lighten(color, 8),
        '--gvray-primary-5': hover,
        '--gvray-primary-6': color,
        '--gvray-primary-7': active,
      }

      const declarations = Object.entries(tokens)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join('\n')

      if (!styleEl) {
        styleEl = document.createElement('style')
        styleEl.id = 'gvray-theme-vars'
        document.head.appendChild(styleEl)
      }
      styleEl.textContent = `:root {\n${declarations}\n}`
    },
    { immediate: true },
  )
}
