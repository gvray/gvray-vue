<template>
  <el-config-provider :size="size" :z-index="zIndex" :locale="elLocale">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { ElConfigProvider } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useSettingStore } from '@/stores/setting'
import { useThemeEffect } from '@/composables/useThemeEffect'
import zhCN from 'element-plus/es/locale/lang/zh-cn'
import enUS from 'element-plus/es/locale/lang/en'
import type { SupportedLocale } from '@/locales'

const { locale } = useI18n()
const settingStore = useSettingStore()

const size = computed(() => settingStore.componentSize || 'default')
const zIndex = 3000

useThemeEffect()

const elementLocales: Record<SupportedLocale, typeof zhCN> = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

const elLocale = computed(
  () => elementLocales[settingStore.language as SupportedLocale] || zhCN,
)

watch(
  () => settingStore.language,
  (lang) => {
    if (lang && lang !== locale.value) {
      locale.value = lang
      document.documentElement.lang = lang
    }
  },
  { immediate: true },
)
</script>

<style lang="scss">
.color-weak {
  filter: invert(80%);
}

.gray-mode {
  filter: grayscale(100%);
}
</style>
