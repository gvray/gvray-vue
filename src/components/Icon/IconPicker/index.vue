<template>
  <el-popover
    v-model:visible="visible"
    :placement="placement"
    :width="780"
    trigger="click"
    popper-class="icon-picker__popper"
  >
    <template #reference>
      <el-input
        :model-value="modelValue"
        placeholder="选择图标"
        readonly
        class="icon-picker__input"
      >
        <template v-if="modelValue" #prefix>
          <Icon :name="toIconKey(modelValue)" :size="14" />
        </template>
      </el-input>
    </template>
    <IconPreview :selected="modelValue" @change="handleChange" />
  </el-popover>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Icon from '../index.vue'
import IconPreview from '../IconPreview/index.vue'
import type { IconKey } from '../map'

interface Props {
  modelValue?: string
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
}
withDefaults(defineProps<Props>(), {
  modelValue: '',
  placement: 'bottom-start',
})
const emit = defineEmits<{ 'update:modelValue': [value: IconKey] }>()

const visible = ref(false)

const toIconKey = (name: string): IconKey => name as IconKey

const handleChange = (icon: IconKey) => {
  emit('update:modelValue', icon)
  visible.value = false
}
</script>

<style lang="scss" scoped>
.icon-picker__input {
  :deep(.el-input__prefix) {
    display: inline-flex;
    align-items: center;
  }
}
</style>
