import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'

export type SupportedLocale = 'zh-CN' | 'en-US'

export const DEFAULT_LANGUAGE =
  (__APP_DEFAULT_LANGUAGE__ as SupportedLocale) || 'zh-CN'

export const messages: Record<SupportedLocale, Record<string, string>> = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

export const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LANGUAGE,
  fallbackLocale: 'zh-CN',
  messages,
  // React 迁移过来的菜单 code 是扁平 key（如 menu.system），vue-i18n 默认把 . 当嵌套路径，需要开启 flatJson
  flatJson: true,
  silentFallbackWarn: true,
  missingWarn: false,
})

export function setI18nLanguage(locale: SupportedLocale) {
  i18n.global.locale.value = locale
  document.documentElement.lang = locale
}

export default i18n
