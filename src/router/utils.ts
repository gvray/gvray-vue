import type { RouteRecordRaw } from 'vue-router'
import router from './index'

const removeRouteFns: Array<() => void> = []

function hasRoutePermission(
  route: RouteRecordRaw,
  permissions: string[],
): boolean {
  const required = (route.meta?.permissions as string[] | undefined) || []
  if (required.length === 0) return true
  if (permissions.includes('*:*:*')) return true
  return required.every((p) => permissions.includes(p))
}

function filterRoute(
  route: RouteRecordRaw,
  permissions: string[],
): RouteRecordRaw | null {
  if (route.children) {
    const filteredChildren = filterDynamicRoutes(route.children, permissions)
    return filteredChildren.length > 0
      ? { ...route, children: filteredChildren }
      : null
  }

  return hasRoutePermission(route, permissions) ? route : null
}

export function filterDynamicRoutes(
  routes: RouteRecordRaw[],
  permissions: string[],
): RouteRecordRaw[] {
  return routes
    .map((route) => filterRoute(route, permissions))
    .filter((route): route is RouteRecordRaw => route !== null)
}

/** 按权限过滤并注册动态路由（幂等：先移除再注册） */
export function addDynamicRoutes(
  routes: RouteRecordRaw[],
  permissions: string[],
): RouteRecordRaw[] {
  resetDynamicRoutes()
  const accessedRoutes = filterDynamicRoutes(routes, permissions)
  accessedRoutes.forEach((route) => {
    const remove = router.addRoute(route)
    removeRouteFns.push(remove)
  })
  return accessedRoutes
}

/** 移除所有已注册的动态路由 */
export function resetDynamicRoutes() {
  removeRouteFns.forEach((remove) => remove())
  removeRouteFns.length = 0
}
