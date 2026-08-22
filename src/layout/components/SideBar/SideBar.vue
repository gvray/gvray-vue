<template>
  <div
    class="sidebar"
    :class="{
      'is-collapsed': settingStore.sidebarCollapsed,
      'is-dark': settingStore.sidebarTheme === 'dark',
    }"
  >
    <logo :collapsed="settingStore.sidebarCollapsed" />

    <el-menu
      :default-openeds="openKeys"
      :default-active="selectedKey"
      :collapse="settingStore.sidebarCollapsed"
      :collapse-transition="true"
      :unique-opened="settingStore.uniqueOpened"
      class="sidebar-menu"
      router
    >
      <sidebar-item
        v-for="(menu, index) in authStore.menus"
        :key="menu.path + index"
        :item="menu"
        :base-path="menu.path"
      />
    </el-menu>

    <collapse-trigger
      :collapsed="settingStore.sidebarCollapsed"
      @toggle="settingStore.toggleSidebarCollapsed"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSettingStore } from '@/stores/setting'
import Logo from './Logo.vue'
import SidebarItem from './SidebarItem.vue'
import CollapseTrigger from './CollapseTrigger.vue'

const authStore = useAuthStore()
const settingStore = useSettingStore()
const route = useRoute()

const openKeys = computed(() => {
  const segments = route.path.split('/').filter(Boolean)
  const keys: string[] = []
  let path = ''
  for (let i = 0; i < segments.length - 1; i++) {
    path += `/${segments[i]}`
    keys.push(path)
  }
  return keys
})

const selectedKey = computed(() => route.path)
</script>

<style lang="scss" scoped>
.sidebar-menu {
  --el-menu-border-color: transparent;
  --el-menu-bg-color: var(--gvray-sider-menu-bg);
  --el-menu-text-color: var(--gvray-sider-menu-text);
  --el-menu-active-color: v-bind('settingStore.colorPrimary');
  --el-menu-hover-bg-color: var(--gvray-sider-bg-hover);
  --el-menu-item-height: 48px;
  --el-menu-sub-item-height: 40px;
}

.sidebar {
  position: relative;
  flex: 0 0 220px;
  max-width: 220px;
  min-width: 220px;
  width: 220px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  transition:
    flex-basis 0.3s,
    max-width 0.3s,
    min-width 0.3s,
    width 0.3s;

  &.is-collapsed {
    flex: 0 0 64px;
    max-width: 64px;
    min-width: 64px;
    width: 64px;
  }
}
</style>
