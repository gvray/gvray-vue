<template>
  <LoginBg :title="siteName">
    <div class="login-page__wrapper">
      <LoginCard
        :site-name="siteName"
        :register-enabled="registerEnabled"
        :guest-account="guestAccount"
        :active-tab="activeTab"
        :countdown="countdown"
        :loading="isLogging"
        :initial-account-values="rememberData"
        @tab-change="activeTab = $event"
        @account-submit="handleAccountSubmit"
        @phone-submit="handlePhoneSubmit"
        @send-code="handleSendCode"
        @navigate-register="handleNavigateRegister"
      />
    </div>
  </LoginBg>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { runtimeConfig } from '@/utils/runtime-config'
import LoginBg from './components/LoginBg.vue'
import LoginCard from './components/LoginCard.vue'
import { useLogin } from './composables/useLogin'

const router = useRouter()
const { system, feature } = runtimeConfig.get()

const siteName = system.name
const registerEnabled = feature.register
const guestAccount = feature.guestAccount

const {
  activeTab,
  isLogging,
  countdown,
  loadRemember,
  handleAccountSubmit,
  handlePhoneSubmit,
  handleSendCode,
} = useLogin()

const rememberData = loadRemember()

const handleNavigateRegister = () => {
  router.push('/register')
}
</script>

<style lang="scss" scoped>
.login-page__wrapper {
  position: relative;
  width: 100%;
}
</style>
