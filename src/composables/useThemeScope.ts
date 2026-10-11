import { computed, type Ref } from 'vue'
import { useRoute } from 'vue-router'

/**
 * 主题作用域层：依据路由 meta.theme 决定是否应用明暗/色弱/灰阶。
 * meta.theme === false 的页面（login/register）固定 light，抑制全部明暗副作用。
 */
export function useThemeScope(): { excluded: Ref<boolean> } {
  const route = useRoute()
  const excluded = computed(() => route.meta.theme === false)
  return { excluded }
}
