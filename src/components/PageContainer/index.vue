<template>
  <div class="page-container" :class="className" :style="style">
    <div v-if="hasHeader" class="page-container__header">
      <Breadcrumb v-if="settingStore.showBreadcrumb" />
      <div v-if="title" class="page-container__title">{{ title }}</div>
    </div>
    <Transition name="page-content" appear>
      <div class="page-container__content">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSettingStore } from '@/stores/setting'
import Breadcrumb from '@/layout/components/Breadcrumb.vue'

interface Props {
  title?: string
  className?: string
  style?: Record<string, any>
}

const props = defineProps<Props>()

const settingStore = useSettingStore()

const hasHeader = computed(() =>
  Boolean(props.title || settingStore.showBreadcrumb),
)
</script>

<style lang="scss" scoped>
.page-container {
  flex: 1;
  background: transparent;
  margin: 0;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.page-container__header {
  margin-bottom: 12px;
}

.page-container__title {
  font-size: 20px;
  font-weight: 500;
  margin-top: 8px;
}

.page-container__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 24px;
  background: var(--gvray-color-bg-container, #fff);
  border-radius: var(--gvray-border-radius-lg, 8px);
  box-sizing: border-box;
}

.page-content-enter-active {
  transition:
    transform 0.15s ease,
    opacity 0.2s ease;
}

.page-content-enter-from {
  transform: translateX(20px);
  opacity: 0;
}
</style>
