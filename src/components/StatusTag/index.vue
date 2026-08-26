<template>
  <el-tag v-if="value !== undefined" :type="tagType" size="small">
    {{ label }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value?: string | number
  options?: API.DictionaryItemResponseDto[]
}

const props = defineProps<Props>()

const DEFAULT_TYPES: Array<
  'success' | 'danger' | 'warning' | 'primary' | 'info'
> = ['success', 'danger', 'warning', 'primary', 'info']

const normalizeValueKey = (v: string | number) => String(v)

const hit = computed(() => {
  const key = normalizeValueKey(props.value ?? '')
  return props.options?.find((opt) => normalizeValueKey(opt.value) === key)
})

const tagType = computed(() => {
  if (!props.options || props.options.length === 0) return 'info'
  const key = normalizeValueKey(props.value ?? '')
  const index = props.options.findIndex(
    (opt) => normalizeValueKey(opt.value) === key,
  )
  if (index < 0) return 'info'
  return DEFAULT_TYPES[index % DEFAULT_TYPES.length]
})

const label = computed(() => {
  const key = normalizeValueKey(props.value ?? '')
  return hit.value?.label ?? key
})
</script>
