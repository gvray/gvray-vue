<template>
  <div class="login-card">
    <div class="login-card__title">
      {{ $t('pages.login.welcome') || '欢迎开启新世界' }}
    </div>

    <div class="login-card__tabs">
      <div
        class="login-card__tab"
        :class="{ active: activeTab === 'account' }"
        @click="$emit('tabChange', 'account')"
      >
        {{ $t('pages.login.account') }}
      </div>
      <div
        class="login-card__tab"
        :class="{ active: activeTab === 'phone' }"
        @click="$emit('tabChange', 'phone')"
      >
        {{ $t('pages.login.phone') }}
      </div>
    </div>

    <div class="login-card__content">
      <template v-if="activeTab === 'account'">
        <el-form
          ref="accountFormRef"
          :model="accountForm"
          size="large"
          class="login-card__form"
          @submit.prevent="handleAccountSubmit"
        >
          <el-form-item
            prop="account"
            :rules="[
              {
                required: true,
                message:
                  $t('pages.login.accountRequired') ||
                  '请您输入手机号/用户名/邮箱',
              },
            ]"
          >
            <el-input
              v-model="accountForm.account"
              :placeholder="$t('pages.login.accountPlaceholder')"
            />
          </el-form-item>
          <el-form-item
            prop="password"
            :rules="[
              {
                required: true,
                message: $t('pages.login.passwordRequired') || '请您输入密码',
              },
            ]"
          >
            <el-input
              v-model="accountForm.password"
              type="password"
              show-password
              :placeholder="$t('pages.login.passwordPlaceholder')"
            />
          </el-form-item>

          <div class="login-card__agreement">
            {{ $t('pages.login.agreementPrefix') }}{{ siteName }}
            <a>{{ $t('pages.login.agreementTerms') }}</a>
            {{ $t('pages.login.and') || '和' }}
            <a>{{ $t('pages.login.agreementPrivacy') }}</a>
          </div>

          <el-form-item>
            <el-button
              type="primary"
              class="login-card__submit"
              @click="handleAccountSubmit"
            >
              {{ $t('pages.login.login') }}
            </el-button>
          </el-form-item>

          <div class="login-card__action-bar">
            <div class="login-card__action-links">
              <a>{{ $t('pages.login.forgotAccount') }}</a>
              <a>{{ $t('pages.login.forgotPassword') }}</a>
            </div>
            <el-checkbox v-model="accountForm.rememberMe">
              {{ $t('pages.login.rememberMe') }}
            </el-checkbox>
          </div>
        </el-form>

        <div v-if="guestAccount" class="login-card__guest">
          <span>
            {{ $t('pages.login.guestAccount') }}：
            <strong>{{ guestAccount.username }}</strong>
            <span class="login-card__guest-label">
              {{ $t('pages.login.password') }}：
              <strong>{{ guestAccount.password }}</strong>
            </span>
          </span>
          <span class="login-card__guest-fill" @click="fillGuestAccount">
            {{ $t('pages.login.autoFill') }}
          </span>
        </div>

        <div class="login-card__divider">
          <span>{{ $t('pages.login.otherLogin') }}</span>
        </div>
        <div class="login-card__social">
          <div class="login-card__social-button">
            <Icon name="GithubFilled" :size="22" />
            <span>{{ $t('pages.login.githubLogin') }}</span>
          </div>
          <div
            class="login-card__social-icon"
            :data-tooltip="$t('pages.login.wechatLogin')"
          >
            <Icon
              name="WechatFilled"
              :size="22"
              :style="{ color: '#07c160' }"
            />
          </div>
          <div
            class="login-card__social-icon"
            :data-tooltip="$t('pages.login.alipayLogin')"
          >
            <Icon
              name="AlipayCircleFilled"
              :size="22"
              :style="{ color: '#1677ff' }"
            />
          </div>
          <div
            class="login-card__social-icon"
            :data-tooltip="$t('pages.login.more')"
          >
            <Icon name="MoreOutlined" :size="22" />
          </div>
        </div>

        <div v-if="registerEnabled" class="login-card__register">
          {{ $t('pages.login.noAccount') }}
          <a @click="$emit('navigateRegister')">{{
            $t('pages.login.register')
          }}</a>
        </div>
      </template>

      <template v-else>
        <el-form
          ref="phoneFormRef"
          :model="phoneForm"
          size="large"
          class="login-card__form"
          @submit.prevent="handlePhoneSubmit"
        >
          <el-form-item
            prop="phone"
            :rules="[
              {
                required: true,
                message: $t('pages.login.phoneRequired') || '请输入手机号',
              },
            ]"
          >
            <PhoneInput v-model="phoneForm.phone" />
          </el-form-item>
          <el-form-item
            prop="verifyCode"
            :rules="[
              {
                required: true,
                message: $t('pages.login.verifyCodeRequired') || '请输入验证码',
              },
            ]"
          >
            <div class="login-card__verify-code">
              <el-input
                v-model="phoneForm.verifyCode"
                class="login-card__verify-code-input"
                :placeholder="$t('pages.login.verifyCodePlaceholder')"
              />
              <el-button
                :disabled="countdown > 0"
                class="login-card__send-code"
                @click="$emit('sendCode')"
              >
                {{
                  countdown > 0
                    ? $t('pages.login.resendCode', { seconds: countdown })
                    : $t('pages.login.sendCode')
                }}
              </el-button>
            </div>
          </el-form-item>

          <div class="login-card__agreement">
            {{ $t('pages.login.agreementPrefix') }}{{ siteName }}
            <a>{{ $t('pages.login.agreementTerms') }}</a>
            {{ $t('pages.login.and') || '和' }}
            <a>{{ $t('pages.login.agreementPrivacy') }}</a>
          </div>

          <el-form-item>
            <el-button
              type="primary"
              class="login-card__submit"
              @click="handlePhoneSubmit"
            >
              {{ $t('pages.login.login') }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-card__divider">
          <span>{{ $t('pages.login.otherLogin') }}</span>
        </div>
        <div class="login-card__social">
          <div class="login-card__social-button">
            <Icon name="GithubFilled" :size="22" />
            <span>{{ $t('pages.login.githubLogin') }}</span>
          </div>
          <div
            class="login-card__social-icon"
            :data-tooltip="$t('pages.login.wechatLogin')"
          >
            <Icon
              name="WechatFilled"
              :size="22"
              :style="{ color: '#07c160' }"
            />
          </div>
          <div
            class="login-card__social-icon"
            :data-tooltip="$t('pages.login.alipayLogin')"
          >
            <Icon
              name="AlipayCircleFilled"
              :size="22"
              :style="{ color: '#1677ff' }"
            />
          </div>
          <div
            class="login-card__social-icon"
            :data-tooltip="$t('pages.login.more')"
          >
            <Icon name="MoreOutlined" :size="22" />
          </div>
        </div>
      </template>
    </div>

    <div class="login-card__mask" :class="{ visible: loading }">
      <Icon name="ElLoading" class-name="login-card__spinner" :size="32" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import PhoneInput from './PhoneInput.vue'
import type { LoginTab } from '../composables/useLogin'

export interface GuestAccount {
  username: string
  password: string
}

interface Props {
  siteName: string
  registerEnabled?: boolean
  guestAccount?: GuestAccount
  activeTab: LoginTab
  countdown: number
  loading?: boolean
  initialAccountValues?: {
    account?: string
    password?: string
    rememberMe?: boolean
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  tabChange: [tab: LoginTab]
  accountSubmit: [
    values: { account: string; password: string; rememberMe: boolean },
  ]
  phoneSubmit: [values: unknown]
  sendCode: []
  navigateRegister: []
}>()

const accountFormRef = ref<FormInstance>()
const phoneFormRef = ref<FormInstance>()

const accountForm = ref({
  account: '',
  password: '',
  rememberMe: true,
})

const phoneForm = ref({
  phone: '',
  verifyCode: '',
})

watch(
  () => props.initialAccountValues,
  (values) => {
    if (values) {
      accountForm.value.account = values.account || ''
      accountForm.value.password = values.password || ''
      accountForm.value.rememberMe = values.rememberMe ?? true
    }
  },
  { immediate: true },
)

const handleAccountSubmit = async () => {
  const valid = await accountFormRef.value?.validate().catch(() => false)
  if (!valid) return
  emit('accountSubmit', {
    account: accountForm.value.account,
    password: accountForm.value.password,
    rememberMe: accountForm.value.rememberMe,
  })
}

const handlePhoneSubmit = async () => {
  const valid = await phoneFormRef.value?.validate().catch(() => false)
  if (!valid) return
  emit('phoneSubmit', { ...phoneForm.value })
}

const fillGuestAccount = () => {
  if (!props.guestAccount) return
  accountForm.value.account = props.guestAccount.username
  accountForm.value.password = props.guestAccount.password
}
</script>

<style lang="scss" scoped>
.login-card {
  position: relative;
  width: 100%;
  height: 660px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 16px;
  padding: 48px 40px 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.35);
  display: flex;
  flex-direction: column;
}

.login-card__title {
  font-size: 28px;
  font-weight: 600;
  color: #1f1f1f;
  margin-bottom: 32px;
}

.login-card__tabs {
  display: flex;
  gap: 32px;
  margin-bottom: 28px;
}

.login-card__tab {
  font-size: 16px;
  color: #595959;
  cursor: pointer;
  padding-bottom: 8px;
  position: relative;
  transition: color 0.3s;

  &:hover {
    color: var(--gvray-color-primary);
  }

  &.active {
    color: var(--gvray-color-primary);
    font-weight: 500;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--gvray-color-primary);
      border-radius: 2px;
    }
  }
}

.login-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.login-card__form {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.login-card__agreement {
  font-size: 13px;
  color: #595959;
  margin-bottom: 20px;

  a {
    color: var(--gvray-color-primary);
    cursor: pointer;
    margin: 0 4px;

    &:hover {
      opacity: 0.8;
    }
  }
}

.login-card__submit {
  width: 100%;
}

.login-card__action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  font-size: 13px;
  color: #595959;
}

.login-card__action-links {
  display: flex;
  gap: 16px;

  a {
    color: #595959;
    cursor: pointer;

    &:hover {
      color: var(--gvray-color-primary);
    }
  }
}

.login-card__guest {
  margin-bottom: 0;
  font-size: 13px;
  color: #8c8c8c;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  strong {
    font-weight: 500;
    color: #1f1f1f;
  }
}

.login-card__guest-label {
  margin-left: 16px;
}

.login-card__guest-fill {
  font-size: 12px;
  color: #8c8c8c;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    color: var(--gvray-color-primary);
  }
}

.login-card__divider {
  display: flex;
  align-items: center;
  margin: 24px 0 20px;
  color: #8c8c8c;
  font-size: 13px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #f0f0f0;
  }

  &::before {
    margin-right: 16px;
  }

  &::after {
    margin-left: 16px;
  }
}

.login-card__social {
  display: flex;
  gap: 12px;
}

.login-card__social-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  color: #1f1f1f;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);

  &:hover {
    border-color: var(--gvray-color-primary);
  }
}

.login-card__social-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 20px;
  color: #595959;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  position: relative;

  &:hover {
    border-color: var(--gvray-color-primary);
  }

  &[data-tooltip]::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%) scale(0.9);
    background: #1f1f1f;
    color: #ffffff;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 4px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: all 0.2s;
  }

  &[data-tooltip]::before {
    content: '';
    position: absolute;
    bottom: calc(100% + 4px);
    left: 50%;
    transform: translateX(-50%) scale(0.9);
    border: 4px solid transparent;
    border-top-color: #1f1f1f;
    opacity: 0;
    transition: all 0.2s;
  }

  &[data-tooltip]:hover::after,
  &[data-tooltip]:hover::before {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
}

.login-card__register {
  text-align: center;
  font-size: 14px;
  color: #595959;
  margin-top: 16px;

  a {
    color: var(--gvray-color-primary);
    cursor: pointer;
    margin-left: 4px;

    &:hover {
      opacity: 0.8;
    }
  }
}

.login-card__verify-code {
  display: flex;
  width: 100%;
}

.login-card__verify-code-input {
  flex: 1;
}

.login-card__mask {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;

  &.visible {
    opacity: 1;
    pointer-events: auto;
  }
}

.login-card__spinner {
  color: var(--gvray-color-primary);
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
