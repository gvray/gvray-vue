<template>
  <nav class="navbar" :class="{ 'is-fixed': settingStore.fixedHeader }">
    <div class="navbar-left">
      <slot />
    </div>
    <div class="navbar-right">
      <el-space :size="4">
        <theme-mode-switch />
        <theme-setting />
        <select-lang />
        <notice-bell />
        <user-menu />
      </el-space>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useSettingStore } from '@/stores/setting'
import ThemeModeSwitch from '../ThemeModeSwitch.vue'
import ThemeSetting from '../ThemeSetting.vue'
import SelectLang from '../SelectLang.vue'
import NoticeBell from '../NoticeBell.vue'
import UserMenu from '../UserMenu.vue'

const settingStore = useSettingStore()
</script>

<script lang="ts">
export default {
  name: 'NavBar',
}
</script>

<style scoped lang="scss">
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  padding: 0 24px;
  background: var(--gvray-color-bg-container, #ffffff);
  border-bottom: 1px solid var(--gvray-color-border-split, #f0f0f0);
  position: relative;
  top: 0;
  z-index: 100;
}

.navbar.is-fixed {
  position: sticky;
}

.navbar-left,
.navbar-right {
  display: flex;
  align-items: center;
}

:deep(.el-space__item:has(.notice-bell)) {
  overflow: visible;
}

.navbar-actions .navbar-action-item {
  cursor: pointer;
  min-width: 28px;
  height: 28px;
  padding: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 14px;
  color: var(--gvray-color-text);
  border-radius: 4px;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    color: var(--gvray-color-primary);
    background-color: var(--gvray-color-fill-secondary);
  }

  &.user-menu {
    min-width: auto;
    height: auto;
    padding: 2px;
    border-radius: 50%;
  }
}
</style>
