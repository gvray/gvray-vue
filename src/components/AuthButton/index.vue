<template>
  <el-button v-if="hasPermission" v-bind="$attrs">
    <slot />
  </el-button>
  <el-tooltip
    v-else-if="mode === 'disabled'"
    :content="typeof denyMessage === 'string' ? denyMessage : '无操作权限'"
    placement="top"
  >
    <el-button v-bind="$attrs" disabled>
      <slot />
    </el-button>
  </el-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

interface Props {
  /** 所需权限代码列表 */
  perms: string[]
  /** 任一权限即可 */
  anyOf?: boolean
  /** 无权限时处理方式 */
  mode?: 'hidden' | 'disabled'
  /** 无权限提示 */
  denyMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  anyOf: false,
  mode: 'hidden',
  denyMessage: '无操作权限',
})

const authStore = useAuthStore()

const hasPermission = computed(() => {
  const required = props.perms ?? []
  if (required.length === 0) return true
  const permissions = authStore.permissions
  if (!permissions || permissions.length === 0) return false
  if (permissions.includes('*:*:*')) return true
  return props.anyOf
    ? required.some((p) => permissions.includes(p))
    : required.every((p) => permissions.includes(p))
})
</script>
