import { defineStore } from 'pinia'

export interface AuthStore {
  profile: API.CurrentUserResponseDto | undefined
  menus: API.AuthMenuResponseDto[] | undefined

  /** 权限代码列表 */
  permissions: string[]

  setProfile: (profile: API.CurrentUserResponseDto | undefined) => void
  setMenus: (menus: API.AuthMenuResponseDto[] | undefined) => void

  /** 登录后一次性设置 profile + menus */
  setAuth: (
    profile: API.CurrentUserResponseDto,
    menus: API.AuthMenuResponseDto[] | undefined,
  ) => void

  /** 退出登录，清空所有认证状态 */
  clearAuth: () => void
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthStore => ({
    profile: undefined,
    menus: undefined,
    permissions: [],
  }),

  actions: {
    setProfile(profile) {
      this.profile = profile
      this.permissions = profile?.permissionCodes || []
    },

    setMenus(menus) {
      this.menus = menus
    },

    setAuth(profile, menus) {
      this.profile = profile
      this.menus = menus
      this.permissions = profile?.permissionCodes || []
    },

    clearAuth() {
      this.profile = undefined
      this.menus = undefined
      this.permissions = []
    },
  },
})
