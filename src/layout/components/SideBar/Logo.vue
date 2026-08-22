<!-- Logo.vue -->
<template>
  <div class="logo-container" @click="goHome">
    <div class="logo-wrapper" :class="{ 'is-collapsed': collapsed }">
      <img
        class="logo-img"
        :src="isDark ? '/logo-dark.svg' : '/logo.svg'"
        alt="Logo"
      />
      <strong v-if="!collapsed" class="logo-title">{{ title }}</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { runtimeConfig } from '@/utils/runtime-config'
import { useSettingStore } from '@/stores/setting'

interface Props {
  collapsed?: boolean
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  title: undefined,
})

const router = useRouter()
const settingStore = useSettingStore()

const isDark = computed(() => settingStore.isDark)

const title = computed(
  () => props.title || runtimeConfig.get().system.name || 'G-ADMIN',
)

const goHome = () => {
  router.push('/')
}
</script>

<style scoped lang="scss">
.logo-container {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  cursor: pointer;
  overflow: hidden;
}

.logo-wrapper {
  border-radius: 8px;
  color: var(--gvray-sider-text, #fff);
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  height: 48px;
  width: 100%;
  min-width: 48px;
  padding-left: 8px;
  overflow: hidden;
  transition:
    border-radius 0.3s,
    font-size 0.3s,
    padding 0.3s;

  .logo-img {
    width: 1.8em;
    height: 1.8em;
    flex-shrink: 0;
  }

  .logo-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
  }

  &.is-collapsed {
    border-radius: 24px;
    font-size: 16px;
    justify-content: center;
    padding-left: 0;
  }
}
</style>
