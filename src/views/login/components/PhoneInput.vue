<template>
  <div class="phone-input">
    <el-select
      v-model="prefix"
      :teleported="false"
      class="phone-input__prefix"
      popper-class="phone-input__prefix-popper"
    >
      <el-option
        v-for="item in phonePrefixOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
    <el-input
      :model-value="modelValue"
      class="phone-input__number"
      :placeholder="$t('pages.login.phonePlaceholder')"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

export interface PhonePrefixOption {
  value: string
  label: string
}

defineProps<{
  modelValue?: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const prefix = ref('+86')

const phonePrefixOptions: PhonePrefixOption[] = [
  { value: '+86', label: '+86 中国大陆' },
  { value: '+852', label: '+852 中国香港' },
  { value: '+853', label: '+853 中国澳门' },
  { value: '+886', label: '+886 中国台湾' },
  { value: '+1', label: '+1 美国 / 加拿大' },
  { value: '+7', label: '+7 俄罗斯' },
  { value: '+33', label: '+33 法国' },
  { value: '+39', label: '+39 意大利' },
  { value: '+44', label: '+44 英国' },
  { value: '+49', label: '+49 德国' },
  { value: '+61', label: '+61 澳大利亚' },
  { value: '+62', label: '+62 印度尼西亚' },
  { value: '+63', label: '+63 菲律宾' },
  { value: '+65', label: '+65 新加坡' },
  { value: '+66', label: '+66 泰国' },
  { value: '+81', label: '+81 日本' },
  { value: '+82', label: '+82 韩国' },
  { value: '+84', label: '+84 越南' },
  { value: '+91', label: '+91 印度' },
  { value: '+92', label: '+92 巴基斯坦' },
]
</script>

<style lang="scss" scoped>
.phone-input {
  display: flex;
  width: 100%;
}

.phone-input__prefix {
  flex-shrink: 0;
  width: 110px;
}

.phone-input__number {
  flex: 1;
}
</style>
