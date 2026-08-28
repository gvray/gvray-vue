<template>
  <span>{{ display }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { format as formatDate } from '@gvray/datekit'

interface Props {
  value?: string | number | Date
  format?: string
  fallback?: string
}

const props = withDefaults(defineProps<Props>(), {
  format: 'YYYY-MM-DD HH:mm:ss',
  fallback: '-',
})

const display = computed(() => {
  if (!props.value) return props.fallback
  const date = new Date(props.value)
  if (Number.isNaN(date.getTime())) return props.fallback
  return formatDate(date, props.format)
})
</script>
