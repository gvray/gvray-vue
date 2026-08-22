<template>
  <div
    class="page-placeholder"
    :class="className"
    :style="{ minHeight: `${minHeight}px`, ...style }"
  >
    <div v-if="icon" class="page-placeholder__icon">
      <slot name="icon"><component :is="icon" /></slot>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  icon?: Component
  minHeight?: number
  className?: string
  style?: Record<string, any>
}

withDefaults(defineProps<Props>(), {
  icon: undefined,
  minHeight: 240,
  className: '',
  style: undefined,
})
</script>

<style lang="scss" scoped>
.page-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--gvray-color-text-placeholder, #bfbfbf);
  padding: 24px 16px;
  text-align: center;
}

.page-placeholder__icon {
  font-size: 48;
  color: var(--gvray-color-text-placeholder, #bfbfbf);
  margin-bottom: 16px;
}
</style>
