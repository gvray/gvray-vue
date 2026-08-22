import { useSettingStore } from '@/stores/setting'

function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
}

export function useChartToken() {
  const store = useSettingStore()

  const token = computed(() => {
    // 依赖 resolvedTheme 和 colorPrimary，让 computed 在主题切换时重新求值
    void store.resolvedTheme
    void store.colorPrimary

    return {
      colorBgContainer: getCssVar('--gvray-color-bg-container'),
      colorBorder: getCssVar('--gvray-color-border'),
      colorText: getCssVar('--gvray-color-text'),
      colorTextSecondary: getCssVar('--gvray-color-text-secondary'),
      colorFillSecondary: getCssVar('--gvray-color-fill-secondary'),
    }
  })

  return { token }
}
