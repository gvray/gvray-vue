import type { Directive } from 'vue'
import { useAuthStore } from '@/stores/auth'

export const hasPermi: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    const perms = Array.isArray(binding.value) ? binding.value : [binding.value]
    const authStore = useAuthStore()
    if (authStore.profile?.isSuperAdmin) return
    const has =
      authStore.permissions.includes('*:*:*') ||
      perms.every((p) => authStore.permissions.includes(p))
    if (!has) el.parentNode?.removeChild(el)
  },
}
