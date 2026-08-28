import type { Directive } from 'vue'
import { usePermission } from '@/composables/usePermission'

export const hasRole: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    const { hasRole } = usePermission()
    if (!hasRole(binding.value)) el.parentNode?.removeChild(el)
  },
}
