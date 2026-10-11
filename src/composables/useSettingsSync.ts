import { debounce } from '@gvray/eskit'
import { useSettingStore } from '@/stores/setting'
import { updateProfileSettings, deleteProfileSettings } from '@/api/profile'
import type { ComponentSize, UserSettings } from '@/constants/runtime-settings'
import type { SiderTheme, ThemeMode } from '@/constants/theme'

/**
 * 用户设置的后端同步编排层。
 *
 * 职责：在 store 纯状态 setter 之上，叠加 debounce 后端同步。
 * 所有「用户主动改动设置」的入口（头部切换 / profile 偏好页 / 表格分页 / 侧边栏折叠）
 * 都应走这里暴露的方法，而非直接调 store.setXxx——后者只改本地、不持久化到服务端。
 *
 * 从后端 hydrate（bootstrap 的 me.preferences、profile 页 onMounted 拉取）仍直接用
 * store.patchSettings，不经过本层，避免回写自身。
 */
export function useSettingsSync() {
  const store = useSettingStore()

  // 模块级 debounce 队列：多次快速改动合并为一次请求
  let pending: Record<string, unknown> = {}

  const flush = debounce(() => {
    const patch = { ...pending }
    pending = {}
    if (Object.keys(patch).length === 0) return
    updateProfileSettings(patch).catch(() => {
      // silent：后端同步失败不影响本地体验
    })
  }, 500)

  const sync = (patch: Record<string, unknown>) => {
    pending = { ...pending, ...patch }
    flush()
  }

  const setTheme = (mode: ThemeMode) => {
    store.setTheme(mode)
    sync({ theme: mode })
  }

  const setColorPrimary = (color: UserSettings['colorPrimary']) => {
    store.setColorPrimary(color)
    sync({ colorPrimary: color })
  }

  const setLanguage = (lang: string) => {
    store.setLanguage(lang)
    sync({ language: lang })
  }

  const setPageSize = (size: number) => {
    store.setPageSize(size)
    sync({ pageSize: size })
  }

  const setComponentSize = (size: ComponentSize) => {
    store.setComponentSize(size)
    sync({ componentSize: size })
  }

  const setShowBreadcrumb = (show: boolean) => {
    store.setShowBreadcrumb(show)
    sync({ showBreadcrumb: show })
  }

  const setSidebarCollapsed = (collapsed: boolean) => {
    store.setSidebarCollapsed(collapsed)
    sync({ sidebarCollapsed: collapsed })
  }

  const setSidebarTheme = (theme: SiderTheme) => {
    store.setSidebarTheme(theme)
    sync({ sidebarTheme: theme })
  }

  const setShowLogo = (show: boolean) => {
    store.setShowLogo(show)
    sync({ showLogo: show })
  }

  const setFixedHeader = (fixed: boolean) => {
    store.setFixedHeader(fixed)
    sync({ fixedHeader: fixed })
  }

  const setShowFooter = (show: boolean) => {
    store.setShowFooter(show)
    sync({ showFooter: show })
  }

  const setColorWeak = (enabled: boolean) => {
    store.setColorWeak(enabled)
    sync({ colorWeak: enabled })
  }

  const setGrayMode = (enabled: boolean) => {
    store.setGrayMode(enabled)
    sync({ grayMode: enabled })
  }

  const setUniqueOpened = (enabled: boolean) => {
    store.setUniqueOpened(enabled)
    sync({ uniqueOpened: enabled })
  }

  const setEnableNotification = (enabled: boolean) => {
    store.setEnableNotification(enabled)
    sync({ enableNotification: enabled })
  }

  const toggleSidebarCollapsed = () => {
    store.toggleSidebarCollapsed()
    sync({ sidebarCollapsed: store.sidebarCollapsed })
  }

  const toggleDarkMode = () => {
    store.toggleDarkMode()
    sync({ theme: store.theme })
  }

  const reset = () => {
    store.reset()
    deleteProfileSettings().catch(() => {
      // silent
    })
  }

  return {
    store,
    setTheme,
    setColorPrimary,
    setLanguage,
    setPageSize,
    setComponentSize,
    setShowBreadcrumb,
    setSidebarCollapsed,
    setSidebarTheme,
    setShowLogo,
    setFixedHeader,
    setShowFooter,
    setColorWeak,
    setGrayMode,
    setUniqueOpened,
    setEnableNotification,
    toggleSidebarCollapsed,
    toggleDarkMode,
    reset,
  }
}
