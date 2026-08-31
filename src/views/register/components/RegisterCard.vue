<template>
  <div class="register-card">
    <div class="register-card__title">
      {{ $t('pages.register.title') }}
    </div>

    <div class="register-card__tabs">
      <div
        class="register-card__tab"
        :class="{ active: activeTab === 'account' }"
        @click="$emit('tabChange', 'account')"
      >
        {{ $t('pages.register.accountTab') }}
      </div>
      <div
        class="register-card__tab"
        :class="{ active: activeTab === 'phone' }"
        @click="$emit('tabChange', 'phone')"
      >
        {{ $t('pages.register.phoneTab') }}
      </div>
    </div>

    <div class="register-card__content">
      <template v-if="activeTab === 'account'">
        <el-form
          ref="accountFormRef"
          :model="accountForm"
          size="large"
          class="register-card__form"
          @submit.prevent="handleAccountSubmit"
        >
          <el-form-item
            prop="username"
            :rules="[
              {
                required: true,
                message: $t('pages.register.usernameRequired'),
              },
              { min: 3, message: $t('pages.register.usernameMin') },
              { max: 32, message: $t('pages.register.usernameMax') },
            ]"
          >
            <el-input
              v-model="accountForm.username"
              :placeholder="$t('pages.register.usernamePlaceholder')"
            >
              <template #prefix>
                <Icon name="UserOutlined" :size="16" />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item
            prop="nickname"
            :rules="[
              {
                required: true,
                message: $t('pages.register.nicknameRequired'),
              },
              { max: 32, message: $t('pages.register.nicknameMax') },
            ]"
          >
            <el-input
              v-model="accountForm.nickname"
              :placeholder="$t('pages.register.nicknamePlaceholder')"
            >
              <template #prefix>
                <Icon name="SmileOutlined" :size="16" />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item
            prop="email"
            :rules="[
              {
                type: 'email',
                message: $t('pages.register.emailInvalid'),
              },
            ]"
          >
            <el-input
              v-model="accountForm.email"
              :placeholder="$t('pages.register.emailPlaceholder')"
            >
              <template #prefix>
                <Icon name="MailOutlined" :size="16" />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item
            prop="password"
            :rules="[
              {
                required: true,
                message: $t('pages.register.passwordRequired'),
              },
              { min: 6, message: $t('pages.register.passwordMin') },
              { max: 32, message: $t('pages.register.passwordMax') },
            ]"
          >
            <el-input
              v-model="accountForm.password"
              type="password"
              show-password
              :placeholder="$t('pages.register.passwordPlaceholder')"
            >
              <template #prefix>
                <Icon name="LockOutlined" :size="16" />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item
            prop="confirmPassword"
            :rules="[{ validator: validateConfirmPassword }]"
          >
            <el-input
              v-model="accountForm.confirmPassword"
              type="password"
              show-password
              :placeholder="$t('pages.register.confirmPasswordPlaceholder')"
            >
              <template #prefix>
                <Icon name="LockOutlined" :size="16" />
              </template>
            </el-input>
          </el-form-item>

          <div class="register-card__agreement">
            {{ $t('pages.register.agreementPrefix') }}{{ siteName }}
            <a>{{ $t('pages.login.agreementTerms') }}</a>
            {{ $t('pages.login.and') || '和' }}
            <a>{{ $t('pages.login.agreementPrivacy') }}</a>
          </div>

          <el-form-item>
            <el-button
              type="primary"
              class="register-card__submit"
              :loading="isRegistering"
              @click="handleAccountSubmit"
            >
              {{
                isRegistering
                  ? $t('pages.register.registering')
                  : $t('pages.register.submit')
              }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="register-card__login-link">
          {{ $t('pages.register.hasAccount') }}
          <a @click="$emit('navigateLogin')">{{
            $t('pages.register.toLogin')
          }}</a>
        </div>
      </template>

      <template v-else>
        <el-form
          ref="phoneFormRef"
          :model="phoneForm"
          size="large"
          class="register-card__form"
          @submit.prevent="handlePhoneSubmit"
        >
          <el-form-item
            prop="phone"
            :rules="[
              {
                required: true,
                message: $t('pages.register.phoneRequired'),
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
                message: $t('pages.register.verifyCodeRequired'),
              },
            ]"
          >
            <div class="register-card__verify-code">
              <el-input
                v-model="phoneForm.verifyCode"
                class="register-card__verify-code-input"
                :placeholder="$t('pages.register.verifyCodePlaceholder')"
              />
              <el-button
                :disabled="countdown > 0"
                class="register-card__send-code"
                @click="$emit('sendCode')"
              >
                {{
                  countdown > 0
                    ? $t('pages.register.resendCode', { seconds: countdown })
                    : $t('pages.register.sendCode')
                }}
              </el-button>
            </div>
          </el-form-item>

          <div class="register-card__agreement">
            {{ $t('pages.register.agreementPrefix') }}{{ siteName }}
            <a>{{ $t('pages.login.agreementTerms') }}</a>
            {{ $t('pages.login.and') || '和' }}
            <a>{{ $t('pages.login.agreementPrivacy') }}</a>
          </div>

          <el-form-item>
            <el-button
              type="primary"
              class="register-card__submit"
              :loading="isRegistering"
              @click="handlePhoneSubmit"
            >
              {{
                isRegistering
                  ? $t('pages.register.registering')
                  : $t('pages.register.submit')
              }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="register-card__login-link">
          {{ $t('pages.register.hasAccount') }}
          <a @click="$emit('navigateLogin')">{{
            $t('pages.register.toLogin')
          }}</a>
        </div>
      </template>
    </div>

    <div class="register-card__mask" :class="{ visible: isRegistering }">
      <Icon name="ElLoading" class-name="register-card__spinner" :size="32" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance } from 'element-plus'
import { useI18n } from 'vue-i18n'
import PhoneInput from '@/views/login/components/PhoneInput.vue'
import type { RegisterTab } from '../composables/useRegister'

interface Props {
  siteName: string
  activeTab: RegisterTab
  countdown: number
  isRegistering: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  tabChange: [tab: RegisterTab]
  accountSubmit: [
    values: {
      username: string
      nickname: string
      email?: string
      password: string
    },
  ]
  phoneSubmit: [values: unknown]
  sendCode: []
  navigateLogin: []
}>()

const { t } = useI18n()

const accountFormRef = ref<FormInstance>()
const phoneFormRef = ref<FormInstance>()

const accountForm = ref({
  username: '',
  nickname: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const phoneForm = ref({
  phone: '',
  verifyCode: '',
})

const validateConfirmPassword = (
  _rule: unknown,
  value: string,
  callback: (error?: Error) => void,
) => {
  if (!value) {
    callback(new Error(t('pages.register.confirmPasswordRequired')))
  } else if (value !== accountForm.value.password) {
    callback(new Error(t('pages.register.confirmPasswordMismatch')))
  } else {
    callback()
  }
}

const handleAccountSubmit = async () => {
  const valid = await accountFormRef.value?.validate().catch(() => false)
  if (!valid) return
  emit('accountSubmit', {
    username: accountForm.value.username,
    nickname: accountForm.value.nickname,
    email: accountForm.value.email || undefined,
    password: accountForm.value.password,
  })
}

const handlePhoneSubmit = async () => {
  const valid = await phoneFormRef.value?.validate().catch(() => false)
  if (!valid) return
  emit('phoneSubmit', { ...phoneForm.value })
}
</script>

<style lang="scss" scoped>
.register-card {
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

.register-card__title {
  font-size: 28px;
  font-weight: 600;
  color: #1f1f1f;
  margin-bottom: 32px;
}

.register-card__tabs {
  display: flex;
  gap: 32px;
  margin-bottom: 28px;
}

.register-card__tab {
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

.register-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.register-card__form {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.register-card__agreement {
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

.register-card__submit {
  width: 100%;
}

.register-card__login-link {
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

.register-card__verify-code {
  display: flex;
  width: 100%;
}

.register-card__verify-code-input {
  flex: 1;
}

.register-card__mask {
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

.register-card__spinner {
  color: var(--gvray-color-primary);
  animation: register-card-rotate 1s linear infinite;
}

@keyframes register-card-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
