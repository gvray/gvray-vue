import { watch } from 'vue'
import { tint, shade } from '@gvray/colorkit'
import { useSettingStore } from '@/stores/setting'

/**
 * 设计 token 层：将用户主色派生出完整色阶注入 :root。
 * 与明暗无关，全程生效（含 login 等免主题页，保证品牌主色一致）。
 *
 * EP 的 light-N / dark-N 是主色按比例混白/混黑；用 tint/shade 派生，
 * 注入 --el-color-primary-light-* 与 --el-color-primary-dark-2，
 * 让 button hover/active/plain 等 EP 控件状态跟随用户主色。
 */
export function useThemeTokens() {
  const store = useSettingStore()

  let styleEl: HTMLStyleElement | null = null

  watch(
    () => store.colorPrimary,
    (color) => {
      // EP light-N = 混白 N*10%；dark-2 = 混黑 20%
      const light3 = tint(color, 0.3)
      const light5 = tint(color, 0.5)
      const light7 = tint(color, 0.7)
      const light8 = tint(color, 0.8)
      const light9 = tint(color, 0.9)
      const dark2 = shade(color, 0.2)

      // hover/active 近似：hover 浅一档，active 深一档
      const hover = light3
      const active = dark2

      const tokens: Record<string, string> = {
        '--el-color-primary': color,
        '--el-color-primary-light-3': light3,
        '--el-color-primary-light-5': light5,
        '--el-color-primary-light-7': light7,
        '--el-color-primary-light-8': light8,
        '--el-color-primary-light-9': light9,
        '--el-color-primary-dark-2': dark2,

        '--gvray-primary-color': color,
        '--gvray-color-primary': color,
        '--gvray-primary-color-hover': hover,
        '--gvray-color-primary-hover': hover,
        '--gvray-primary-color-active': active,
        '--gvray-color-primary-active': active,
        '--gvray-primary-color-outline': `${color}33`,
        '--gvray-color-primary-bg': light9,
        '--gvray-color-primary-border': light7,
        '--gvray-color-primary-border-hover': light5,
        '--gvray-primary-1': light9,
        '--gvray-primary-2': light7,
        '--gvray-primary-3': light5,
        '--gvray-primary-4': light3,
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
      // 覆盖 EP 默认（:root）与 html.dark 的同名变量，确保明暗两端都跟随主色
      styleEl.textContent = `:root,\nhtml.dark {\n${declarations}\n}`
    },
    { immediate: true },
  )
}
