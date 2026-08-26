import { LOGIN_PATH, WHITE_LIST } from '@/constants'
import {
  createLoginRedirect,
  isSafeRedirect,
  normalizeRedirect,
} from '@gvray/adminkit'
import router from '@/router'
import type { RouteLocationRaw } from 'vue-router'
import { destroyAuthModal } from './authModal'
import { tokenManager } from './token'

function buildLoginRedirect(
  currentPath: string,
  currentFullPath: string,
): RouteLocationRaw | undefined {
  if (WHITE_LIST.includes(currentPath)) return undefined

  const redirect = normalizeRedirect(currentFullPath)
  if (!isSafeRedirect(redirect, { denyList: WHITE_LIST })) return undefined

  sessionStorage.removeItem('redirectPath')
  return createLoginRedirect(LOGIN_PATH, redirect)
}

/**
 * 跳转到登录页并携带重定向参数
 */
export function redirectToLogin() {
  // 清除本地凭证，避免旧 token 被带到登录后的请求中
  tokenManager.clearTokens()
  // 销毁可能残留的 401 弹窗
  destroyAuthModal()

  const { path, fullPath } = router.currentRoute.value
  const location = buildLoginRedirect(path, fullPath)
  if (location) {
    router.push(location)
  }
}

/**
 * 构建登录重定向路由（供路由守卫使用，避免在 guard 内直接调用 router.push）
 */
export function getLoginRedirect(
  currentPath: string,
  currentFullPath: string,
): RouteLocationRaw | undefined {
  return buildLoginRedirect(currentPath, currentFullPath)
}
