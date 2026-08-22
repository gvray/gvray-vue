<template>
  <div class="collapse-trigger">
    <button
      type="button"
      class="collapse-trigger__btn"
      :aria-label="collapsed ? '展开侧边栏' : '折叠侧边栏'"
      @click="onToggle"
    >
      <Icon :name="collapsed ? 'RightOutlined' : 'LeftOutlined'" :size="11" />
    </button>
  </div>
</template>

<script setup lang="ts">
import Icon from '@/components/Icon/index.vue'

interface Props {
  collapsed?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  toggle: []
}>()

const onToggle = () => {
  emit('toggle')
}
</script>

<style scoped lang="scss">
.collapse-trigger {
  position: absolute;
  top: 108px;
  right: 0;
  z-index: 101;
  transform: translateX(50%);
}

.collapse-trigger__btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 50%;
  cursor: pointer;
  outline: none;
  font-size: 11px;
  color: var(--gvray-sider-text-secondary, #8c8c8c);
  background: var(--gvray-sider-bg, #fff);
  border: 1px solid var(--gvray-sider-border, #f0f0f0);
  box-shadow: 0 1px 4px var(--gvray-sider-shadow, rgba(0, 0, 0, 0.08));
  transition:
    color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    color: var(--gvray-sider-text, #262626);
    background: var(--gvray-sider-bg-hover, #f5f5f5);
    box-shadow: 0 2px 8px var(--gvray-sider-shadow, rgba(0, 0, 0, 0.12));
  }
}
</style>
