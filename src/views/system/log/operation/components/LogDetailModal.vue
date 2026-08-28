<template>
  <el-dialog
    v-model="dialogVisible"
    title="日志详情"
    width="680px"
    :close-on-click-modal="false"
    @close="emit('close')"
  >
    <div v-loading="loading" class="log-detail">
      <el-empty v-if="error" :description="error">
        <el-button type="primary" @click="loadDetail">重新加载</el-button>
      </el-empty>

      <template v-else-if="data">
        <div
          class="summary-bar"
          :class="isSuccess ? 'is-success' : 'is-failure'"
        >
          <div class="summary-left">
            <Icon
              :name="isSuccess ? 'CheckCircleFilled' : 'CloseCircleFilled'"
              class="summary-icon"
            />
            <span class="summary-text">{{
              isSuccess ? '请求成功' : '请求失败'
            }}</span>
          </div>
          <div class="summary-right">
            <DateTimeFormat :value="String(data.createdAt ?? '')" />
            <span v-if="data.latencyMs" class="latency-badge">
              {{ data.latencyMs }} ms
            </span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">基础信息</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="方法">
              <el-tag
                :type="methodTagType(String(data.method ?? ''))"
                size="small"
              >
                {{ data.method || '-' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="模块">
              {{ data.module || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="操作">
              {{ data.action || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="日志ID">
              {{ data.id ?? '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="资源" :span="2">
              {{ data.resource || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="路径" :span="2">
              {{ data.path || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="section">
          <div class="section-title">客户端信息</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="用户">
              {{ data.username || data.nickname || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="IP">
              {{ data.ipAddress || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="地点">
              {{ data.location || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="耗时">
              {{ data.latencyMs ? `${data.latencyMs} ms` : '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="UA" :span="2">
              {{ data.userAgent || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <el-collapse class="raw-collapse">
          <el-collapse-item title="请求参数" name="params">
            <div class="params-grid">
              <el-card shadow="never" class="param-card">
                <template #header>Query</template>
                <pre class="json-code">{{ formatJson(data.query) }}</pre>
              </el-card>
              <el-card shadow="never" class="param-card">
                <template #header>Body</template>
                <pre class="json-code">{{ formatJson(data.body) }}</pre>
              </el-card>
            </div>
          </el-collapse-item>
          <el-collapse-item title="原始数据" name="raw">
            <pre class="json-code">{{ formatJson(data) }}</pre>
          </el-collapse-item>
        </el-collapse>

        <el-alert
          v-if="data.message"
          :type="isSuccess ? 'success' : 'error'"
          :title="String(data.message)"
          show-icon
          :closable="false"
          class="msg-alert"
        />
      </template>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { getOperationLogById } from '@/api/operationLog'
import { logger } from '@/utils'
import { methodTagType } from '../util'

interface Props {
  visible: boolean
  logId?: number | string
}
const props = defineProps<Props>()
const emit = defineEmits<{
  'update:visible': [v: boolean]
  'close': []
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const data = ref<Record<string, any> | null>(null)

const dialogVisible = computed({
  get: () => props.visible,
  set: (v: boolean) => emit('update:visible', v),
})

const isSuccess = computed(() => data.value?.result === 'success')

const formatJson = (val: unknown): string => {
  if (val === null || val === undefined) return '{}'
  if (typeof val === 'object' && Object.keys(val as object).length === 0)
    return '{}'
  try {
    return JSON.stringify(val, null, 2)
  } catch {
    return String(val)
  }
}

const loadDetail = async () => {
  if (props.logId === undefined || props.logId === '') return
  loading.value = true
  error.value = null
  try {
    const res = await getOperationLogById(String(props.logId))
    data.value = (res?.data as Record<string, any>) ?? null
  } catch (e) {
    logger.error(e)
    error.value = e instanceof Error ? e.message : '加载详情失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

watch(
  () => props.visible,
  (v) => {
    if (v) {
      data.value = null
      error.value = null
      loadDetail()
    }
  },
)
</script>

<style lang="scss" scoped>
.log-detail {
  min-height: 200px;
}

.summary-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid;

  &.is-success {
    background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 100%);
    border-color: #c2e7b0;

    .summary-icon {
      color: #67c23a;
    }

    .summary-text {
      color: #529b2e;
    }
  }

  &.is-failure {
    background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
    border-color: #fbc4c4;

    .summary-icon {
      color: #f56c6c;
    }

    .summary-text {
      color: #c45656;
    }
  }
}

.summary-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.summary-icon {
  font-size: 22px;
}

.summary-text {
  font-size: 16px;
  font-weight: 600;
}

.summary-right {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.latency-badge {
  background: var(--el-fill-color-light);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
  color: var(--el-text-color-primary);
}

.section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
  padding-left: 10px;
  border-left: 3px solid var(--el-color-primary);
}

.params-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.param-card {
  :deep(.el-card__header) {
    padding: 8px 12px;
    font-size: 13px;
    font-weight: 600;
  }
}

.json-code {
  margin: 0;
  padding: 12px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 240px;
  overflow: auto;
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}

.msg-alert {
  margin-top: 16px;
}
</style>
