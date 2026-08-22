import type { ThemeModeWithoutSystem } from '@/constants'

let mediaQuery: MediaQueryList | null = null
let listener: ((e: MediaQueryListEvent) => void) | null = null

export function getSystemTheme(): ThemeModeWithoutSystem {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function startSystemThemeWatcher(
  setSystemTheme: (v: ThemeModeWithoutSystem) => void,
): void {
  if (mediaQuery) return

  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  listener = (e: MediaQueryListEvent) => {
    setSystemTheme(e.matches ? 'dark' : 'light')
  }
  mediaQuery.addEventListener('change', listener)
  // 立即同步一次当前值
  setSystemTheme(mediaQuery.matches ? 'dark' : 'light')
}

export function stopSystemThemeWatcher(): void {
  if (mediaQuery && listener) {
    mediaQuery.removeEventListener('change', listener)
    mediaQuery = null
    listener = null
  }
}
