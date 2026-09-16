import { createApp } from 'vue'
import App from '@/app/App'
import '@/app/global'
import router from '@/router'
import store from '@/stores'
import i18n from '@/locales'
import ElementPlus from 'element-plus'
import directives from '@/directive'
import { addDynamicRoutes } from '@/router/utils'
import { dynamicRoutes } from '@/router'
import { useAuthStore, useDictStore, useSettingStore } from '@/stores'
import { buildPreferences } from '@/constants/runtime-settings'
import { runtimeConfig } from '@/utils/runtime-config'
import { tokenManager } from '@/utils/token'
import { getRuntimeConfig } from '@/api/system'
import { queryMe, queryMenus } from '@/api/auth'
import { getDictionaryItemsByTypeCodes } from '@/api/dictionary'
import { logger } from '@/utils'
import { wrapToBizError } from '@/utils/errors'

async function initializeRuntime() {
  const runtimeRes = await getRuntimeConfig().catch((error) => {
    logger.error(error)
    return undefined
  })
  runtimeConfig.set(runtimeRes?.data)

  const systemName = runtimeConfig.get().system.name
  if (systemName) document.title = systemName

  const settingStore = useSettingStore()
  const runtimeDefaults = buildPreferences(runtimeConfig.get().ui)
  // 初始化优先级：runtime default < localStorage persisted < 用户偏好
  settingStore.$patch({ ...runtimeDefaults, ...settingStore.$state })
}

/**
 * 装载登录态数据：身份信息、菜单、用户偏好、常用字典。
 * bootstrap（已登录）与登录成功后共用，避免逻辑重复。
 *
 * @returns 是否成功装载 profile。bootstrap 据此决定是否初始化动态路由；
 *   登录流程据此决定是否提示失败，避免"登录成功"却因 profile 缺失被守卫弹回。
 */
export async function loadAuthData(): Promise<boolean> {
  if (!tokenManager.isAuthenticated()) return false

  let me: API.CurrentUserResponseDto | undefined
  let menus: API.AuthMenuResponseDto[] | undefined

  try {
    const [meRes, menusRes] = await Promise.all([
      queryMe({ skipErrorHandler: true }),
      queryMenus({ skipErrorHandler: true }),
    ])
    me = meRes.data
    menus = menusRes.data
  } catch (error) {
    const bizError = wrapToBizError(error)
    // 只有真正的未授权/凭证过期才清凭证；
    // 网络抖动或服务端异常保留原凭证，避免误踢用户
    if (bizError.details?.status === 401) {
      tokenManager.clearTokens()
    } else {
      logger.error('获取初始化用户信息失败', error)
    }
  }

  if (me) {
    const authStore = useAuthStore()
    authStore.setAuth(me, menus)
    useSettingStore().$patch({ ...(me.preferences || {}) })
    // profile 就绪后注册动态路由，bootstrap 与登录流程共用
    addDynamicRoutes(dynamicRoutes, authStore.permissions)
  }

  // 字典预加载失败不阻塞登录态判定，profile 在即视为成功
  if (tokenManager.isAuthenticated()) {
    try {
      if (!useDictStore().getDict('common_status')) {
        const dictRes = await getDictionaryItemsByTypeCodes(
          { typeCodes: 'common_status' },
          { skipErrorHandler: true },
        )
        if (dictRes.data?.common_status) {
          useDictStore().setDict('common_status', dictRes.data.common_status)
        }
      }
    } catch (error) {
      logger.error('预加载 common_status 字典失败', error)
    }
  }

  return !!me
}

/**
 * 应用启动入口：创建实例 → 注册插件 → 初始化运行时/认证数据 → 挂载。
 * runtimeConfig 全应用只在此拉取一次，登录后复用 loadAuthData 装载认证态。
 */
export async function bootstrap() {
  const app = createApp(App)
  app.use(store)

  try {
    await initializeRuntime()
    await loadAuthData()
  } catch (error) {
    logger.error('应用初始化失败', error)
  }

  app.use(router)
  app.use(i18n)
  app.use(ElementPlus)
  app.use(directives)
  app.mount('#app')
}
