<template>
  <div class="app-layout">
    <side-bar />
    <div class="app-layout__viewport">
      <nav-bar />
      <app-main />
    </div>
  </div>
</template>

<script setup lang="ts">
import SideBar from './components/SideBar/SideBar.vue'
import NavBar from './components/NavBar/NavBar.vue'
import AppMain from './components/AppMain/AppMain.vue'
</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  height: 100%;
}

.app-layout__viewport {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-width: 0;
  overflow: hidden;
}
</style>
