<template>
  <el-tooltip
    :content="id"
    placement="top"
    :disabled="!id || id.length <= length"
  >
    <span class="copy-id" @click="copy">
      {{ display }}
    </span>
  </el-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'

interface Props {
  id?: string
  length?: number
}

const props = withDefaults(defineProps<Props>(), {
  id: '',
  length: 8,
})

const display = computed(() => {
  const id = props.id ?? ''
  return id.length > props.length ? `${id.slice(0, props.length)}…` : id
})

const copy = async () => {
  if (!props.id) return
  try {
    await navigator.clipboard.writeText(props.id)
    ElMessage.success('已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}
</script>

<style lang="scss" scoped>
.copy-id {
  cursor: pointer;
  color: var(--el-color-primary);
  font-family: monospace;

  &:hover {
    text-decoration: underline;
  }
}
</style>
