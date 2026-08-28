<template>
  <el-tooltip :content="tooltipTitle" placement="top">
    <div class="back-button" @click="handleClick">
      <Icon name="ElArrowLeft" />
    </div>
  </el-tooltip>
</template>

<script setup lang="ts">
interface Props {
  /** 点击回调 */
  onClick?: () => void
  /** Tooltip 提示文字，默认 "返回" */
  tooltipTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  tooltipTitle: '返回',
  onClick: undefined,
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  props.onClick?.()
  emit('click')
}
</script>

<style lang="scss" scoped>
.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 8px;
  background: linear-gradient(
    135deg,
    var(--gvray-color-primary) 0%,
    var(--gvray-color-primary-hover) 100%
  );
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;

  &:hover {
    transform: translateX(-2px);
    box-shadow: 0 4px 12px rgb(from var(--gvray-color-primary) r g b / 0.35);
  }
}
</style>
