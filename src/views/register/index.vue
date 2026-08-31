<template>
  <LoginBg :title="siteName">
    <div class="register-page__wrapper">
      <RegisterCard
        :site-name="siteName"
        :active-tab="activeTab"
        :countdown="countdown"
        :is-registering="isRegistering"
        @tab-change="activeTab = $event"
        @account-submit="handleAccountSubmit"
        @phone-submit="handlePhoneSubmit"
        @send-code="handleSendCode"
        @navigate-login="navigateToLogin"
      />
    </div>
  </LoginBg>
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { runtimeConfig } from '@/utils/runtime-config'
import LoginBg from '@/views/login/components/LoginBg.vue'
import RegisterCard from './components/RegisterCard.vue'
import { useRegister } from './composables/useRegister'

const router = useRouter()
const { system, feature } = runtimeConfig.get()

const siteName = system.name
const registerEnabled = feature.register

const {
  activeTab,
  isRegistering,
  countdown,
  handleAccountSubmit,
  handlePhoneSubmit,
  handleSendCode,
  navigateToLogin,
} = useRegister()

onBeforeMount(() => {
  if (!registerEnabled) {
    router.replace('/login')
  }
})
</script>

<style lang="scss" scoped>
.register-page__wrapper {
  position: relative;
  width: 100%;
}
</style>
