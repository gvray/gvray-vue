<template>
  <component
    :is="config.component"
    v-if="config?.type === 'antd'"
    :class="className"
    :style="{ fontSize: `${size}px`, ...style }"
  />
  <component
    :is="config.component"
    v-else-if="config?.type === 'lucide' || config?.type === 'svg'"
    :size="size"
    :class="className"
    :style="style"
  />
  <el-icon
    v-else-if="config?.type === 'element'"
    :size="size"
    :class="className"
    :style="style"
  >
    <component :is="config.component" />
  </el-icon>
  <svg
    v-else-if="config?.type === 'sprite'"
    :width="size"
    :height="size"
    :class="className"
    :style="{ fill: 'currentColor', ...style }"
    aria-hidden="true"
  >
    <use :xlink:href="`#${config.symbol}`" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { iconMap } from './map'
import type { IconKey } from './map'

interface Props {
  /** 图标名称：必须是 iconMap 中注册的 key */
  name: IconKey
  size?: number
  className?: string
  style?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  size: 16,
  className: '',
  style: undefined,
})

const config = computed(() => iconMap[props.name])
</script>
