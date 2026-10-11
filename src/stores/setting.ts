import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  DEFAULT_RUNTIME_CONFIG,
  type ComponentSize,
  type UserSettings,
  buildPreferences,
} from '@/constants/runtime-settings'
import type {
  SiderTheme,
  ThemeMode,
  ThemeModeWithoutSystem,
} from '@/constants/theme'

function buildDefaultState(): UserSettings {
  return buildPreferences(DEFAULT_RUNTIME_CONFIG.ui)
}

export const useSettingStore = defineStore(
  'setting',
  () => {
    // ── state ───────────────────────────────────────────────────────
    const defaults = buildDefaultState()

    const theme = ref<ThemeMode>(defaults.theme)
    const colorPrimary = ref<UserSettings['colorPrimary']>(
      defaults.colorPrimary,
    )
    const language = ref<string>(defaults.language)
    const pageSize = ref<number>(defaults.pageSize)
    const componentSize = ref<ComponentSize>(defaults.componentSize)
    const showBreadcrumb = ref<boolean>(defaults.showBreadcrumb)
    const sidebarCollapsed = ref<boolean>(defaults.sidebarCollapsed)
    const sidebarTheme = ref<SiderTheme>(defaults.sidebarTheme)
    const showLogo = ref<boolean>(defaults.showLogo)
    const fixedHeader = ref<boolean>(defaults.fixedHeader)
    const showFooter = ref<boolean>(defaults.showFooter)
    const colorWeak = ref<boolean>(defaults.colorWeak)
    const grayMode = ref<boolean>(defaults.grayMode)
    const uniqueOpened = ref<boolean>(defaults.uniqueOpened)
    const enableNotification = ref<boolean>(defaults.enableNotification)

    /** 系统主题（不持久化，由 useThemeMode 监听 prefers-color-scheme 写入） */
    const systemTheme = ref<ThemeModeWithoutSystem>('light')

    // ── getters ─────────────────────────────────────────────────────
    const resolvedTheme = computed<ThemeModeWithoutSystem>(() =>
      theme.value === 'system' ? systemTheme.value : theme.value,
    )

    const isDark = computed(
      () =>
        (theme.value === 'system' ? systemTheme.value : theme.value) === 'dark',
    )

    // ── actions ─────────────────────────────────────────────────────
    const patchSettings = (patch: Partial<UserSettings>) => {
      for (const [key, val] of Object.entries(patch)) {
        if (val === undefined) continue
        switch (key) {
          case 'theme':
            theme.value = val as ThemeMode
            break
          case 'colorPrimary':
            colorPrimary.value = val as UserSettings['colorPrimary']
            break
          case 'language':
            language.value = val as string
            break
          case 'pageSize':
            pageSize.value = val as number
            break
          case 'componentSize':
            componentSize.value = val as ComponentSize
            break
          case 'showBreadcrumb':
            showBreadcrumb.value = val as boolean
            break
          case 'sidebarCollapsed':
            sidebarCollapsed.value = val as boolean
            break
          case 'sidebarTheme':
            sidebarTheme.value = val as SiderTheme
            break
          case 'showLogo':
            showLogo.value = val as boolean
            break
          case 'fixedHeader':
            fixedHeader.value = val as boolean
            break
          case 'showFooter':
            showFooter.value = val as boolean
            break
          case 'colorWeak':
            colorWeak.value = val as boolean
            break
          case 'grayMode':
            grayMode.value = val as boolean
            break
          case 'uniqueOpened':
            uniqueOpened.value = val as boolean
            break
          case 'enableNotification':
            enableNotification.value = val as boolean
            break
        }
      }
    }

    const setTheme = (mode: ThemeMode) => {
      theme.value = mode
    }

    const setColorPrimary = (color: UserSettings['colorPrimary']) => {
      colorPrimary.value = color
    }

    const setLanguage = (lang: string) => {
      language.value = lang
    }

    const setPageSize = (size: number) => {
      pageSize.value = size
    }

    const setComponentSize = (size: ComponentSize) => {
      componentSize.value = size
    }

    const setShowBreadcrumb = (show: boolean) => {
      showBreadcrumb.value = show
    }

    const setSidebarCollapsed = (collapsed: boolean) => {
      sidebarCollapsed.value = collapsed
    }

    const setSidebarTheme = (s: SiderTheme) => {
      sidebarTheme.value = s
    }

    const setShowLogo = (show: boolean) => {
      showLogo.value = show
    }

    const setFixedHeader = (fixed: boolean) => {
      fixedHeader.value = fixed
    }

    const setShowFooter = (show: boolean) => {
      showFooter.value = show
    }

    const setColorWeak = (enabled: boolean) => {
      colorWeak.value = enabled
    }

    const setGrayMode = (enabled: boolean) => {
      grayMode.value = enabled
    }

    const setUniqueOpened = (enabled: boolean) => {
      uniqueOpened.value = enabled
    }

    const setEnableNotification = (enabled: boolean) => {
      enableNotification.value = enabled
    }

    const toggleSidebarCollapsed = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    const toggleDarkMode = () => {
      const modes: ThemeMode[] = ['light', 'dark', 'system']
      const currentIndex = modes.indexOf(theme.value)
      theme.value = modes[(currentIndex + 1) % modes.length]
    }

    const reset = () => {
      const next = buildDefaultState()
      theme.value = next.theme
      colorPrimary.value = next.colorPrimary
      language.value = next.language
      pageSize.value = next.pageSize
      componentSize.value = next.componentSize
      showBreadcrumb.value = next.showBreadcrumb
      sidebarCollapsed.value = next.sidebarCollapsed
      sidebarTheme.value = next.sidebarTheme
      showLogo.value = next.showLogo
      fixedHeader.value = next.fixedHeader
      showFooter.value = next.showFooter
      colorWeak.value = next.colorWeak
      grayMode.value = next.grayMode
      uniqueOpened.value = next.uniqueOpened
      enableNotification.value = next.enableNotification
    }

    return {
      theme,
      colorPrimary,
      language,
      pageSize,
      componentSize,
      showBreadcrumb,
      sidebarCollapsed,
      sidebarTheme,
      showLogo,
      fixedHeader,
      showFooter,
      colorWeak,
      grayMode,
      uniqueOpened,
      enableNotification,
      systemTheme,
      resolvedTheme,
      isDark,
      patchSettings,
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
  },
  {
    persist: {
      key: 'app-settings',
      pick: [
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
  },
)
