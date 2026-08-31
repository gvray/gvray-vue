import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { logger } from '@/utils'
import { register } from '@/api/auth'

export type RegisterTab = 'account' | 'phone'

export interface RegisterResult {
  success: boolean
  message?: string
}

export function useRegister() {
  const router = useRouter()
  const activeTab = ref<RegisterTab>('account')
  const isRegistering = ref(false)
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

  const navigateToLogin = () => {
    router.push('/login')
  }

  const registerByAccount = async (values: {
    username: string
    nickname: string
    email?: string
    password: string
  }): Promise<RegisterResult> => {
    isRegistering.value = true
    try {
      const res = await register({
        username: values.username,
        nickname: values.nickname,
        email: values.email,
        password: values.password,
      })
      return { success: true, message: res.message }
    } catch (error: any) {
      return {
        success: false,
        message: error?.message,
      }
    } finally {
      isRegistering.value = false
    }
  }

  const registerByPhone = async (_values: unknown): Promise<RegisterResult> => {
    // TODO: 手机号注册功能开发中
    logger.log('手机号注册:', _values)
    return { success: false, message: '手机号注册功能开发中' }
  }

  const handleAccountSubmit = async (values: {
    username: string
    nickname: string
    email?: string
    password: string
  }) => {
    const result = await registerByAccount(values)
    if (!result.success) {
      if (result.message) ElMessage.error(result.message)
      return
    }
    ElMessage.success(result.message || '注册成功，请登录')
    navigateToLogin()
  }

  const handlePhoneSubmit = async (values: unknown) => {
    const result = await registerByPhone(values)
    if (!result.success) {
      if (result.message) ElMessage.error(result.message)
      return
    }
    ElMessage.success(result.message || '注册成功，请登录')
    navigateToLogin()
  }

  const handleSendCode = () => {
    if (countdown.value > 0) return
    startCountdown(60)
  }

  return {
    activeTab,
    isRegistering,
    countdown,
    startCountdown,
    registerByAccount,
    registerByPhone,
    handleAccountSubmit,
    handlePhoneSubmit,
    handleSendCode,
    navigateToLogin,
  }
}
