import { watch, type Ref } from 'vue'
import { usePreferredDark } from '@vueuse/core'
import { useSettingStore } from '@/stores/setting'

/**
 * 明暗层：用户偏好 + OS 偏好 → <html class="dark">；colorWeak/grayMode → body class。
 * 由 useThemeScope 的 excluded 门控：免主题页面抑制全部明暗/滤镜副作用。
 */
export function useThemeMode(excluded: Ref<boolean>) {
  const store = useSettingStore()
  const html = document.documentElement

  // OS prefers-color-scheme → store.systemTheme（由 VueUse 管理 matchMedia 生命周期）
  const prefersDark = usePreferredDark()
  watch(
    prefersDark,
    (d) => {
      store.systemTheme = d ? 'dark' : 'light'
    },
    { immediate: true },
  )

  // 明暗 class（被路由作用域门控）
  watch(
    [() => store.resolvedTheme, excluded],
    ([theme, ex]) => {
      html.classList.toggle('dark', !ex && theme === 'dark')
    },
    { immediate: true },
  )

  // 色弱滤镜
  watch(
    [() => store.colorWeak, excluded],
    ([v, ex]) => {
      document.body.classList.toggle('color-weak', !ex && v)
    },
    { immediate: true },
  )

  // 灰阶滤镜
  watch(
    [() => store.grayMode, excluded],
    ([v, ex]) => {
      document.body.classList.toggle('gray-mode', !ex && v)
    },
    { immediate: true },
  )
}
