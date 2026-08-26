import type { Directive } from 'vue'
import { useAuthStore } from '@/stores/auth'

export const hasRole: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    const roles = Array.isArray(binding.value) ? binding.value : [binding.value]
    const authStore = useAuthStore()
    if (authStore.profile?.isSuperAdmin) return
    const userRoleKeys = authStore.profile?.roles?.map((r) => r.roleKey) ?? []
    const has = roles.some((r) => userRoleKeys.includes(r))
    if (!has) el.parentNode?.removeChild(el)
  },
}
