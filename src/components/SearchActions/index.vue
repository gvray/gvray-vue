<template>
  <el-col :span="8" style="margin-left: auto">
    <div class="search-actions">
      <el-button type="primary" @click.prevent="emit('search')">
        {{ submitText }}
      </el-button>
      <el-button @click="emit('reset')">
        {{ resetText }}
      </el-button>
      <el-button v-if="expandable" type="primary" link @click="toggleExpanded">
        {{ currentExpandText }}
        <Icon v-if="expanded" name="ElArrowUp" class-name="el-icon--right" />
        <Icon v-else name="ElArrowDown" class-name="el-icon--right" />
      </el-button>
    </div>
  </el-col>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  expanded?: boolean
  expandable?: boolean
  submitText?: string
  resetText?: string
  expandText?: string
  collapseText?: string
}

const props = withDefaults(defineProps<Props>(), {
  expanded: false,
  expandable: true,
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
