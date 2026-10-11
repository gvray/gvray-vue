import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface AuthStore {
  profile: API.CurrentUserResponseDto | undefined
  menus: API.AuthMenuResponseDto[] | undefined

  /** 权限代码列表 */
  permissions: string[]
}

export const useAuthStore = defineStore('auth', () => {
  const profile = ref<API.CurrentUserResponseDto | undefined>(undefined)
  const menus = ref<API.AuthMenuResponseDto[] | undefined>(undefined)
  const permissions = ref<string[]>([])

  const setProfile = (p: API.CurrentUserResponseDto | undefined) => {
    profile.value = p
    permissions.value = p?.permissionCodes || []
  }

  const setMenus = (m: API.AuthMenuResponseDto[] | undefined) => {
    menus.value = m
  }

  const setAuth = (
    p: API.CurrentUserResponseDto,
    m: API.AuthMenuResponseDto[] | undefined,
  ) => {
    profile.value = p
    menus.value = m
    permissions.value = p?.permissionCodes || []
  }

  const clearAuth = () => {
    profile.value = undefined
    menus.value = undefined
    permissions.value = []
  }

  return {
    profile,
    menus,
    permissions,
    setProfile,
    setMenus,
    setAuth,
    clearAuth,
  }
})
