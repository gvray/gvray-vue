<template>
  <section class="app-main">
    <router-view v-slot="{ Component, route }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="[]">
          <component :is="Component" :key="route.path" />
        </keep-alive>
      </transition>
    </router-view>

    <app-footer
      :visible="settingStore.showFooter"
      :text="runtimeConfig.get().system.footerText"
      :copyright="runtimeConfig.get().system.copyright"
      :icp="runtimeConfig.get().system.icp"
    />
  </section>
</template>

<script setup lang="ts">
import { useSettingStore } from '@/stores/setting'
import { runtimeConfig } from '@/utils/runtime-config'
import AppFooter from '../AppFooter.vue'

const settingStore = useSettingStore()
</script>

<style lang="scss" scoped>
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 100%;
  position: relative;
  overflow: auto;
  box-sizing: border-box;
  padding: 16px;
  background-color: var(--gvray-color-bg);
}
</style>

<style lang="scss">
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background-color: #c0c0c0;
  border-radius: 3px;
}
</style>
