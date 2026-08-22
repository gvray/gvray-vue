<template>
  <div class="placeholder-view">
    <el-empty :description="title" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() => (route.meta.title as string) || '页面建设中')
</script>

<style scoped>
.placeholder-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}
</style>
