<template>
  <el-dialog
    :model-value="visible"
    title="查看配置详情"
    width="680px"
    destroy-on-close
    @update:model-value="(v) => emit('update:visible', v)"
  >
    <template #header>
      <div class="viewer-header">
        <Icon name="ElView" />
        <span>查看配置详情</span>
      </div>
    </template>
    <el-descriptions :column="2" border size="small">
      <el-descriptions-item label="配置名称" :span="2">
        <span class="viewer-strong">{{ config.name }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="配置键">
        <el-tag type="primary" class="viewer-mono">{{ config.key }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="配置类型">
        <el-tag>{{ typeLabel }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="配置分组">
        <el-tag>{{ groupLabel }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="排序权重">
        {{ config.sort }}
      </el-descriptions-item>
      <el-descriptions-item label="是否公开">
        <el-tag :type="config.isPublic ? 'success' : 'info'">
          {{ config.isPublic ? '公开' : '私有' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <StatusTag :value="config.status" :options="dict.common_status" />
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        <DateTimeFormat :value="config.createdAt" />
      </el-descriptions-item>
      <el-descriptions-item v-if="config.description" label="描述" :span="2">
        {{ config.description }}
      </el-descriptions-item>
      <el-descriptions-item v-if="config.remark" label="备注" :span="2">
        {{ config.remark }}
      </el-descriptions-item>
    </el-descriptions>

    <div class="viewer-value">
      <div class="viewer-value-header">
        <span class="viewer-strong">配置值</span>
        <el-button size="small" @click="handleCopy">
          <template #icon><Icon name="ElDocumentCopy" /></template>
          复制
        </el-button>
      </div>
      <div class="viewer-value-box">{{ displayValue }}</div>
    </div>
    <template #footer>
      <el-button @click="emit('update:visible', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { copyText } from '@gvray/domkit'
import { logger } from '@/utils'

interface Props {
  config: API.ConfigResponseDto
  visible: boolean
  dict: Record<string, API.DictionaryItemResponseDto[]>
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'update:visible', v: boolean): void }>()

const groupLabel = computed(() => {
  const g = props.config.group
  return props.dict.config_group?.find((d) => String(d.value) === g)?.label || g
})

const typeLabel = computed(() => {
  const t = String(props.config.type)
  return props.dict.config_type?.find((d) => String(d.value) === t)?.label || t
})

const displayValue = computed(() => {
  if (props.config.type === 'json') {
    try {
      return JSON.stringify(JSON.parse(props.config.value), null, 2)
    } catch {
      return props.config.value
    }
  }
  return props.config.value
})

const handleCopy = async () => {
  try {
    await copyText(props.config.value)
    ElMessage.success('已复制')
  } catch (error) {
    logger.error(error)
  }
}
</script>

<style scoped>
.viewer-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.viewer-strong {
  font-weight: 600;
}
.viewer-mono {
  font-family: monospace;
}
.viewer-value {
  margin-top: 16px;
}
.viewer-value-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.viewer-value-box {
  padding: 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 6px;
  border: 1px solid var(--el-border-color);
  font-family: monospace;
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 260px;
  overflow: auto;
  line-height: 1.6;
}
</style>
