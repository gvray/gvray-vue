import { createApp } from 'vue'
import router from '@/router'
import store from '@/stores'
import i18n from '@/locales'
import App from '@/App.vue'
import ElementPlus from 'element-plus'
import '@/request'

import 'normalize.css'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'virtual:svg-icons-register'
import '@/assets/styles/index.scss'
import './permission'

import { setupPermissionDirectives } from '@/directive/permission'
import { logger } from '@/utils'
import { useAuthStore, useDictStore, useSettingStore } from '@/stores'
import { addDynamicRoutes } from '@/router/utils'
import { dynamicRoutes } from '@/router'
import { runtimeConfig } from '@/utils/runtime-config'
import { tokenManager } from '@/utils/token'
import { getRuntimeConfig } from '@/api/system'
import { queryMe, queryMenus } from '@/api/auth'
import { getDictionaryItemsByTypeCodes } from '@/api/dictionary'
import { buildPreferences } from '@/constants/runtime-settings'

async function initializeRuntime() {
  const runtimeRes = await getRuntimeConfig().catch(() => undefined)
  runtimeConfig.set(runtimeRes?.data)

  const systemName = runtimeConfig.get().system.name
  if (systemName) document.title = systemName

  const settingStore = useSettingStore()
  const runtimeDefaults = buildPreferences(runtimeConfig.get().ui)
  // 初始化优先级：runtime default < localStorage persisted < 用户偏好
  settingStore.$patch({ ...runtimeDefaults, ...settingStore.$state })
}

async function initializeAuth(): Promise<boolean> {
  if (!tokenManager.isAuthenticated()) return false

  const [meRes, menusRes] = await Promise.allSettled([
    queryMe({ skipErrorHandler: true }).catch(() => undefined),
    queryMenus().catch(() => undefined),
  ])
  const me = meRes.status === 'fulfilled' ? meRes.value?.data : undefined
  const menus =
    menusRes.status === 'fulfilled' ? menusRes.value?.data : undefined

  if (!me) {
    tokenManager.clearTokens()
    return false
  }

  const authStore = useAuthStore()
  authStore.setAuth(me, menus)
  useSettingStore().$patch({ ...(me.preferences || {}) })
  return true
}

async function initializeRoutes() {
  addDynamicRoutes(dynamicRoutes, useAuthStore().permissions)
}

async function initializeDictionaries() {
  try {
    if (!useDictStore().getDict('common_status')) {
      const dictRes = await getDictionaryItemsByTypeCodes({
        typeCodes: 'common_status',
      })
      if (dictRes.data?.common_status) {
        useDictStore().setDict('common_status', dictRes.data.common_status)
      }
    }
  } catch (error) {
    logger.error('预加载 common_status 字典失败', error)
  }
}

async function bootstrap() {
  const app = createApp(App)
  app.use(store)

  try {
    await initializeRuntime()
    const isAuthed = await initializeAuth()
    if (isAuthed) {
      await Promise.all([initializeRoutes(), initializeDictionaries()])
    }
  } catch (error) {
    logger.error('应用初始化失败', error)
  }

  app.use(router)
  app.use(i18n)
  app.use(ElementPlus)
  setupPermissionDirectives(app)
  app.mount('#app')
}

bootstrap()
