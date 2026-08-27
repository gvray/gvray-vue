<template>
  <div class="search-actions">
    <el-button type="primary" @click.prevent="emit('search')">
      {{ submitText }}
    </el-button>
    <el-button @click="emit('reset')">
      {{ resetText }}
    </el-button>
    <el-button type="primary" link @click="toggleExpanded">
      {{ currentExpandText }}
      <el-icon class="el-icon--right">
        <ArrowUp v-if="expanded" />
        <ArrowDown v-else />
      </el-icon>
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'

interface Props {
  expanded?: boolean
  submitText?: string
  resetText?: string
  expandText?: string
  collapseText?: string
}

const props = withDefaults(defineProps<Props>(), {
  expanded: false,
  submitText: '搜索',
  resetText: '重置',
  expandText: '展开',
  collapseText: '收起',
})

const emit = defineEmits<{
  'update:expanded': [expanded: boolean]
  'search': []
  'reset': []
}>()

const currentExpandText = computed(() =>
  props.expanded ? props.collapseText : props.expandText,
)

const toggleExpanded = () => {
  emit('update:expanded', !props.expanded)
}
</script>

<style lang="scss" scoped>
.search-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
}
</style>
