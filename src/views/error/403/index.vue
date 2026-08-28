<template>
  <div class="error-page">
    <el-result
      icon="warning"
      title="无权访问"
      sub-title="抱歉，您没有访问该页面的权限，请联系管理员"
    >
      <!-- 后续将 src/assets/illustrations/403.svg 放入此 slot，替换内置图标 -->
      <!-- <template #icon>
        <img src="@/assets/illustrations/403.svg" class="error-illustration" alt="403" />
      </template> -->
      <template #extra>
        <el-button type="primary" @click="handleGoHome">
          <Icon name="ElHomeFilled" />
          返回首页
        </el-button>
        <el-button @click="handleBack">
          <Icon name="ElBack" />
          返回上页
        </el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

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
