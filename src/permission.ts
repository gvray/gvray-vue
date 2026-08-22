import router from './router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { LOGIN_PATH, WHITE_LIST } from '@/constants'
import { tokenManager, logger } from '@/utils'
import { getLoginRedirect } from '@/utils/url'
import { useAuthStore } from '@/stores/auth'

NProgress.configure({ showSpinner: false })

const isWhiteList = (path: string) => WHITE_LIST.includes(path)

function hasPermission(
  requiredPermissions: string[],
  userPermissions: string[],
) {
  if (!requiredPermissions || requiredPermissions.length === 0) return true
  if (userPermissions.includes('*:*:*')) return true
  return requiredPermissions.every((p) => userPermissions.includes(p))
}

router.beforeEach((to, from, next) => {
  NProgress.start()
  logger.info(`路由跳转：${from.fullPath} -> ${to.fullPath} ${to.meta.title}`)

  const isAuthenticated = tokenManager.isAuthenticated()

  if (isAuthenticated) {
    if (to.path === LOGIN_PATH) {
      next({ path: '/' })
      NProgress.done()
      return
    }

    const authStore = useAuthStore()
    const requiredPermissions = (to.meta.permissions as string[]) || []
    if (!hasPermission(requiredPermissions, authStore.permissions)) {
      next({ path: '/403' })
      NProgress.done()
      return
    }

    next()
  } else {
    if (isWhiteList(to.path)) {
      next()
    } else {
      const redirect = getLoginRedirect(to.path, to.fullPath)
      next(redirect || { path: LOGIN_PATH })
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
