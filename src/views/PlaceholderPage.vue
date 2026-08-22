<template>
  <div class="placeholder-page">
    <el-result icon="info" :title="pageTitle" sub-title="页面开发中，敬请期待">
      <template #extra>
        <el-button type="primary" @click="$router.push('/')"
          >返回首页</el-button
        >
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const pageTitle = computed(() => (route.meta.title as string) || '页面开发中')
</script>

<style scoped>
.placeholder-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 160px);
}
</style>
