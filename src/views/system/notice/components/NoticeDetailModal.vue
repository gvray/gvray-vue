<template>
  <el-dialog
    :model-value="visible"
    title="通知公告详情"
    width="640px"
    destroy-on-close
    @update:model-value="(v) => emit('update:visible', v)"
  >
    <template #header>
      <div class="detail-header">
        <Icon name="ElView" />
        <span>通知公告详情</span>
      </div>
    </template>
    <el-descriptions :column="2" border size="small">
      <el-descriptions-item label="标题" :span="2">
        <span class="detail-strong">{{ notice.title }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="类型">
        <el-tag>{{ noticeTypeMap[notice.type] || notice.type }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <StatusTag :value="notice.status" :options="statusOptions" />
      </el-descriptions-item>
      <el-descriptions-item label="排序权重">
        {{ notice.sort }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        <DateTimeFormat :value="notice.createdAt" />
      </el-descriptions-item>
      <el-descriptions-item label="更新时间" :span="2">
        <DateTimeFormat :value="notice.updatedAt" />
      </el-descriptions-item>
    </el-descriptions>

    <div class="detail-content">
      <span class="detail-strong">内容</span>
      <div class="detail-content-box">{{ notice.content }}</div>
    </div>
    <template #footer>
      <el-button @click="emit('update:visible', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
interface Props {
  notice: API.NoticeResponseDto
  visible: boolean
}

defineProps<Props>()
const emit = defineEmits<{ (e: 'update:visible', v: boolean): void }>()

const noticeTypeMap: Record<string, string> = {
  notice: '通知',
  announcement: '通告',
}
const statusOptions = [
  { label: '启用', value: 'enabled' },
  { label: '禁用', value: 'disabled' },
]
</script>

<style scoped>
.detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.detail-strong {
  font-weight: 600;
}
.detail-content {
  margin-top: 16px;
}
.detail-content-box {
  margin-top: 8px;
  padding: 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 6px;
  border: 1px solid var(--el-border-color);
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 320px;
  overflow: auto;
  line-height: 1.6;
}
</style>
