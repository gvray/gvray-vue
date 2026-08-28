import { useAuthStore } from '@/stores/auth'

export interface PermiOptions {
  /** 所需权限代码列表 */
  perms?: string[]
  /** 任一权限即可（默认需全部满足） */
  anyOf?: boolean
}

export type PermiBinding = string | string[] | PermiOptions

export function usePermission() {
  const authStore = useAuthStore()

  function hasPermission(value: PermiBinding): boolean {
    let perms: string[] = []
    let anyOf = false
    if (Array.isArray(value)) {
      perms = value
    } else if (typeof value === 'string') {
      perms = [value]
    } else if (value && typeof value === 'object') {
      perms = value.perms ?? []
      anyOf = !!value.anyOf
    }
    if (perms.length === 0) return true
    const permissions = authStore.permissions ?? []
    if (permissions.length === 0) return false
    if (permissions.includes('*:*:*')) return true
    return anyOf
      ? perms.some((p) => permissions.includes(p))
      : perms.every((p) => permissions.includes(p))
  }

  function hasRole(value: string | string[]): boolean {
    if (authStore.profile?.isSuperAdmin) return true
    const userRoleKeys = authStore.profile?.roles?.map((r) => r.roleKey) ?? []
    const roles = Array.isArray(value) ? value : [value]
    return roles.some((r) => userRoleKeys.includes(r))
  }

  return { hasPermission, hasRole }
}
