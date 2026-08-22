import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import storetify from 'storetify'
import { logger } from '@/utils'
import { buildPreferences } from '@/constants/runtime-settings'
import { useAuthStore, useDictStore, useSettingStore } from '@/stores'
import { runtimeConfig } from '@/utils/runtime-config'
import { tokenManager } from '@/utils/token'
import { encrypt, decrypt } from '@/utils/secret'
import { login, queryMe, queryMenus } from '@/api/auth'
import { getRuntimeConfig } from '@/api/system'
import { getDictionaryItemsByTypeCodes } from '@/api/dictionary'
import { addDynamicRoutes } from '@/router/utils'
import { dynamicRoutes } from '@/router'

export type LoginTab = 'account' | 'phone'

export interface RememberData {
  account?: string
  password?: string
  rememberMe?: boolean
}

export interface LoginResult {
  success: boolean
  message?: string
}

const REMEMBER_KEY = 'rememberMe'
const REMEMBER_TTL = 60 * 60 * 24 * 30

export function useLogin() {
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()
  const settingStore = useSettingStore()
  const dictStore = useDictStore()

  const activeTab = ref<LoginTab>('account')
  const isLogging = ref(false)
  const countdown = ref(0)

  let countdownTimer: ReturnType<typeof setInterval> | null = null

  const startCountdown = (seconds = 60) => {
    countdown.value = seconds
  }

  watch(countdown, (value) => {
    if (value <= 0) {
      if (countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
      }
      return
    }
    if (countdownTimer) return
    countdownTimer = setInterval(() => {
      countdown.value -= 1
    }, 1000)
  })

  const loadRemember = (): RememberData | undefined => {
    const stored = storetify(REMEMBER_KEY) as
      | { account?: string; password?: string; rememberMe?: boolean }
      | undefined
    if (!stored?.account) return undefined
    return {
      account: stored.account,
      password: stored.password ? decrypt(stored.password) : undefined,
      rememberMe: Boolean(stored.rememberMe),
    }
  }

  const saveRemember = (values: {
    account: string
    password: string
    rememberMe: boolean
  }) => {
    storetify(
      REMEMBER_KEY,
      {
        account: values.account,
        password: encrypt(values.password),
        rememberMe: values.rememberMe,
      },
      REMEMBER_TTL,
    )
  }

  const clearRemember = () => {
    storetify(REMEMBER_KEY, undefined)
  }

  const loadInitData = async () => {
    let runtimeConfigData: Record<string, unknown> | undefined
    try {
      const res = await getRuntimeConfig()
      runtimeConfigData = res.data
    } catch (error) {
      logger.error(error)
    }

    const [meRes, menusRes] = await Promise.all([
      queryMe({ skipErrorHandler: true }).catch(() => undefined),
      queryMenus().catch(() => undefined),
    ])
    const me = meRes?.data
    const menus = menusRes?.data

    runtimeConfig.set(runtimeConfigData)

    settingStore.$patch({
      ...buildPreferences(runtimeConfig.get().ui),
      ...(me?.preferences || {}),
    })

    if (me) {
      authStore.setAuth(me, menus)
      addDynamicRoutes(dynamicRoutes, authStore.permissions)
    }
  }

  const preloadDict = async () => {
    try {
      if (!dictStore.getDict('common_status')) {
        const dictRes = await getDictionaryItemsByTypeCodes({
          typeCodes: 'common_status',
        })
        if (dictRes.data?.common_status) {
          dictStore.setDict('common_status', dictRes.data.common_status)
        }
      }
    } catch (error) {
      logger.error('预加载 common_status 字典失败', error)
    }
  }

  const navigateAfterLogin = () => {
    const redirect = route.query.redirect
    const safeRedirect =
      typeof redirect === 'string' &&
      redirect.startsWith('/') &&
      !redirect.startsWith('//')
        ? redirect
        : '/'
    router.push(safeRedirect)
  }

  const loginByAccount = async (values: {
    account: string
    password: string
    rememberMe?: boolean
  }): Promise<LoginResult> => {
    isLogging.value = true

    if (values.rememberMe) {
      saveRemember({
        account: values.account,
        password: values.password,
        rememberMe: values.rememberMe,
      })
    } else {
      clearRemember()
    }

    try {
      const res = await login({
        account: values.account,
        password: values.password,
      })
      tokenManager.setTokens(
        res.data.access_token,
        res.data.refresh_token,
        res.data.access_token_expires_in,
        res.data.refresh_token_expires_in,
      )

      await loadInitData()
      await preloadDict()

      return { success: true, message: res.message }
    } catch (error: any) {
      tokenManager.clearTokens()
      return {
        success: false,
        message: error?.details?.status === 401 ? error.message : undefined,
      }
    } finally {
      isLogging.value = false
    }
  }

  const loginByPhone = async (_values: unknown): Promise<LoginResult> => {
    // TODO: 手机号登录功能开发中
    logger.log('手机号登录:', _values)
    return { success: false }
  }

  const handleAccountSubmit = async (values: {
    account: string
    password: string
    rememberMe?: boolean
  }) => {
    const result = await loginByAccount(values)
    if (!result.success) {
      if (result.message) ElMessage.error(result.message)
      return
    }
    ElMessage.success(result.message || '登录成功')
    navigateAfterLogin()
  }

  const handlePhoneSubmit = async (values: unknown) => {
    await loginByPhone(values)
  }

  const handleSendCode = () => {
    if (countdown.value > 0) return
    startCountdown(60)
  }

  return {
    activeTab,
    isLogging,
    countdown,
    startCountdown,
    loadRemember,
    loginByAccount,
    loginByPhone,
    handleAccountSubmit,
    handlePhoneSubmit,
    handleSendCode,
  }
}
