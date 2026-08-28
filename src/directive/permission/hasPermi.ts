import type { Directive } from 'vue'
import { usePermission, type PermiBinding } from '@/composables/usePermission'

export const hasPermi: Directive<HTMLElement, PermiBinding> = {
  mounted(el, binding) {
    const { hasPermission } = usePermission()
    if (!hasPermission(binding.value)) el.parentNode?.removeChild(el)
  },
}
