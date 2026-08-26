<template>
  <div class="error-page">
    <el-result
      icon="info"
      title="页面不见了"
      sub-title="您访问的页面可能已被删除、移动或暂时不可用"
    >
      <!-- 后续将 src/assets/illustrations/404.svg 放入此 slot，替换内置图标 -->
      <!-- <template #icon>
        <img src="@/assets/illustrations/404.svg" class="error-illustration" alt="404" />
      </template> -->
      <template #extra>
        <el-button type="primary" @click="handleGoHome">
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </el-button>
        <el-button @click="handleBack">
          <el-icon><Back /></el-icon>
          返回上页
        </el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { HomeFilled, Back } from '@element-plus/icons-vue'

const router = useRouter()

const handleGoHome = () => router.push('/')
const handleBack = () => router.back()
</script>

<style scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 24px;
}

.error-illustration {
  width: 280px;
}
</style>
