import {
  DEFAULT_RUNTIME_CONFIG,
  type ComponentSize,
  type SiderTheme,
  type ThemeMode,
  type UserSettings,
  buildPreferences,
} from '@/constants/runtime-settings'
import { defineStore } from 'pinia'
import type { ThemeModeWithoutSystem } from '@/constants/theme'

// ─── Store ──────────────────────────────────────────────────────

interface SettingState extends UserSettings {
  /** 系统主题（不持久化，由 useThemeEffect 监听 prefers-color-scheme 写入） */
  systemTheme: ThemeModeWithoutSystem
}

export const useSettingStore = defineStore('setting', {
  state: (): SettingState => ({
    ...buildPreferences(DEFAULT_RUNTIME_CONFIG.ui),
    systemTheme: 'light',
  }),

  getters: {
    resolvedTheme(state): ThemeModeWithoutSystem {
      return state.theme === 'system' ? state.systemTheme : state.theme
    },

    isDark(state): boolean {
      return (
        (state.theme === 'system' ? state.systemTheme : state.theme) === 'dark'
      )
    },
  },

  actions: {
    patchSettings(patch: Partial<UserSettings>) {
      for (const [key, val] of Object.entries(patch)) {
        if (val !== undefined) {
          ;(this as any)[key] = val
        }
      }
    },

    setTheme(mode: ThemeMode) {
      this.theme = mode
    },

    setColorPrimary(color: UserSettings['colorPrimary']) {
      this.colorPrimary = color
    },

    setLanguage(lang: string) {
      this.language = lang
    },

    setPageSize(size: number) {
      this.pageSize = size
    },

    setComponentSize(size: ComponentSize) {
      this.componentSize = size
    },

    setShowBreadcrumb(show: boolean) {
      this.showBreadcrumb = show
    },

    setSidebarCollapsed(collapsed: boolean) {
      this.sidebarCollapsed = collapsed
    },

    setSidebarTheme(theme: SiderTheme) {
      this.sidebarTheme = theme
    },

    setShowLogo(show: boolean) {
      this.showLogo = show
    },

    setFixedHeader(fixed: boolean) {
      this.fixedHeader = fixed
    },

    setShowFooter(show: boolean) {
      this.showFooter = show
    },

    setColorWeak(enabled: boolean) {
      this.colorWeak = enabled
    },

    setGrayMode(enabled: boolean) {
      this.grayMode = enabled
    },

    setUniqueOpened(enabled: boolean) {
      this.uniqueOpened = enabled
    },

    setEnableNotification(enabled: boolean) {
      this.enableNotification = enabled
    },

    toggleSidebarCollapsed() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    toggleDarkMode() {
      const modes: ThemeMode[] = ['light', 'dark', 'system']
      const currentIndex = modes.indexOf(this.theme)
      this.theme = modes[(currentIndex + 1) % modes.length]
    },

    reset() {
      Object.assign(this, buildPreferences(DEFAULT_RUNTIME_CONFIG.ui))
    },
  },

  persist: {
    key: 'app-settings',
    paths: [
      'theme',
      'colorPrimary',
      'language',
      'pageSize',
      'componentSize',
      'showBreadcrumb',
      'sidebarCollapsed',
      'sidebarTheme',
      'showLogo',
      'fixedHeader',
      'showFooter',
      'colorWeak',
      'grayMode',
      'uniqueOpened',
      'enableNotification',
    ],
  },
})
