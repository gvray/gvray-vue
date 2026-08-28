<template>
  <PageContainer>
    <div class="cache-monitor">
      <!-- ── 顶部工具栏 ── -->
      <div class="cache-monitor__toolbar">
        <span class="cache-monitor__title">缓存监控</span>
        <el-space>
          <el-tag
            v-if="health !== null"
            :type="health ? 'success' : 'danger'"
            size="small"
          >
            {{ health ? 'Redis 正常' : 'Redis 异常' }}
          </el-tag>
          <el-link :underline="false" @click="refresh">
            <span
              class="cache-monitor__action-icon"
              :class="{ 'is-spin': statsLoading }"
            >
              <Icon name="ReloadOutlined" />
            </span>
            刷新
          </el-link>
          <el-space :size="4">
            <span class="cache-monitor__auto-text">自动刷新</span>
            <el-switch v-model="autoRefresh" size="small" />
          </el-space>
        </el-space>
      </div>

      <!-- ── 统计卡片 ── -->
      <el-row :gutter="16">
        <el-col
          v-for="card in statCards"
          :key="card.title"
          :xs="24"
          :sm="12"
          :lg="8"
          :xl="4"
        >
          <el-card
            v-loading="statsLoading"
            class="cache-monitor__stat-card"
            shadow="hover"
          >
            <div class="cache-monitor__stat-title">{{ card.title }}</div>
            <div
              class="cache-monitor__stat-value"
              :style="{ color: card.color }"
            >
              {{ card.value
              }}<span v-if="card.suffix" class="cache-monitor__stat-suffix">{{
                card.suffix
              }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- ── 缓存键列表 ── -->
      <el-row :gutter="16" class="cache-monitor__row">
        <el-col :span="24">
          <el-card class="cache-monitor__detail-card">
            <template #header>
              <div class="cache-monitor__card-header">
                <span>缓存键列表</span>
                <el-space>
                  <el-input
                    v-model="pattern"
                    placeholder="Key 匹配模式，如 sys:dict:*"
                    style="width: 280px"
                    clearable
                    @keyup.enter="onSearch"
                  >
                    <template #prefix>
                      <Icon name="SearchOutlined" />
                    </template>
                  </el-input>
                  <el-button
                    v-hasPermi="[PERM.MONITOR_CACHE_LIST]"
                    type="primary"
                    @click="onSearch"
                  >
                    <template #icon><Icon name="SearchOutlined" /></template>
                    搜索
                  </el-button>
                  <el-button
                    v-hasPermi="[PERM.MONITOR_CACHE_CLEAR]"
                    type="danger"
                    @click="clearModalVisible = true"
                  >
                    <template #icon><Icon name="DeleteOutlined" /></template>
                    清理缓存
                  </el-button>
                </el-space>
              </div>
            </template>
            <TablePro
              v-model:page="page"
              v-model:page-size="pageSize"
              :total="total"
              @page-change="handlePageChange"
              @size-change="handleSizeChange"
            >
              <el-table
                v-loading="loading"
                :data="list"
                style="width: 100%"
                row-key="key"
                size="small"
              >
                <el-table-column
                  label="缓存 Key"
                  prop="key"
                  min-width="200"
                  show-overflow-tooltip
                />
                <el-table-column
                  label="数据类型"
                  prop="type"
                  width="120"
                  align="center"
                />
                <el-table-column label="剩余 TTL" width="140" align="center">
                  <template #default="{ row }">
                    <template v-if="typeof row.ttl !== 'number'">-</template>
                    <el-tag v-else-if="row.ttl === -1" size="small">
                      永久
                    </el-tag>
                    <el-tag
                      v-else-if="row.ttl === -2"
                      type="danger"
                      size="small"
                    >
                      已过期
                    </el-tag>
                    <span v-else>{{ formatTtl(row.ttl) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="大小" width="120" align="center">
                  <template #default="{ row }">
                    {{
                      typeof row.size === 'number' ? formatBytes(row.size) : '-'
                    }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="操作"
                  width="100"
                  fixed="right"
                  align="center"
                >
                  <template #default="{ row }">
                    <el-button
                      v-hasPermi="[PERM.MONITOR_CACHE_CLEAR]"
                      type="danger"
                      link
                      size="small"
                      @click="handleDeleteKey(row as API.CacheKeyInfoDto)"
                    >
                      <template #icon><Icon name="DeleteOutlined" /></template>
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </TablePro>
          </el-card>
        </el-col>
      </el-row>

      <!-- ── 清理缓存 Modal ── -->
      <el-dialog
        v-model="clearModalVisible"
        title="清理缓存"
        width="480px"
        :close-on-click-modal="false"
        destroy-on-close
      >
        <el-space direction="vertical" :size="12" fill style="width: 100%">
          <span>请输入要清理的 key 匹配模式：</span>
          <el-input
            v-model="clearPattern"
            placeholder="如 sys:dict:* 或不填清空全部"
            clearable
            @keyup.enter="handleClearCacheByPattern"
          />
          <span class="cache-monitor__tip"
            >留空将清空所有缓存，请谨慎操作！</span
          >
        </el-space>
        <template #footer>
          <el-button @click="clearModalVisible = false">取消</el-button>
          <el-button
            type="danger"
            :loading="clearLoading"
            @click="handleClearCacheByPattern"
          >
            确认清理
          </el-button>
        </template>
      </el-dialog>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  queryCacheHealth,
  queryCacheStats,
  queryCacheKeys,
  clearCache,
} from '@/api/cacheMonitor'
import { useTablePage } from '@/composables/useTablePage'
import { PERM } from '@/constants/permission'
import { formatBytes, logger } from '@/utils'

// ─── 健康/统计 ───────────────────────────────────────────
const health = ref<boolean | null>(null)
const stats = ref<API.CacheStatsDto | null>(null)
const statsLoading = ref(false)
const error = ref<string | null>(null)
const autoRefresh = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const fetchHealth = async () => {
  try {
    const res = await queryCacheHealth()
    health.value = res.data ?? false
    error.value = null
  } catch (err) {
    logger.error(err)
    health.value = false
    error.value = 'Redis 健康检查失败'
  }
}

const fetchStats = async () => {
  statsLoading.value = true
  try {
    const res = await queryCacheStats()
    if (res.data) stats.value = res.data
    error.value = null
  } catch (err) {
    logger.error(err)
    error.value = '缓存统计信息加载失败'
  } finally {
    statsLoading.value = false
  }
}

const refresh = () => {
  fetchHealth()
  fetchStats()
}

const startTimer = () => {
  timer = setInterval(refresh, 5000)
}
const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

watch(autoRefresh, (val) => {
  if (val) startTimer()
  else stopTimer()
})

onMounted(refresh)
onUnmounted(stopTimer)

// ─── 缓存键列表 ──────────────────────────────────────────
const pattern = ref('')

const {
  loading,
  list,
  total,
  page,
  pageSize,
  handleSearch,
  handlePageChange,
  handleSizeChange,
  reload,
} = useTablePage<API.CacheKeyInfoDto>((params) =>
  queryCacheKeys({
    pattern: params.pattern || pattern.value.trim() || '*',
    page: params.page,
    pageSize: params.pageSize,
  }),
)

const onSearch = () => handleSearch({ pattern: pattern.value.trim() || '*' })

// ─── 统计卡片 ───────────────────────────────────────────
const statCards = computed(() => {
  const s = stats.value
  const hitRatePercent = s ? Math.round(s.hitRate * 100) : 0
  const hitRateColor = !s
    ? undefined
    : s.hitRate >= 0.9
      ? '#52c41a'
      : s.hitRate >= 0.7
        ? '#faad14'
        : '#ff4d4f'
  return [
    {
      title: '命中率',
      value: hitRatePercent,
      suffix: '%',
      color: hitRateColor,
    },
    { title: '命中次数', value: s?.hits ?? 0, color: undefined },
    { title: '未命中次数', value: s?.misses ?? 0, color: '#ff4d4f' },
    { title: '总 Key 数', value: s?.totalKeys ?? 0, color: undefined },
    {
      title: '已用内存',
      value: s ? formatBytes(s.usedMemory) : '0 B',
      color: undefined,
    },
    { title: '清理次数', value: s?.evictions ?? 0, color: undefined },
  ]
})

// ─── TTL 格式化 ──────────────────────────────────────────
const formatTtl = (ttl: number) => {
  const hours = Math.floor(ttl / 3600)
  const minutes = Math.floor((ttl % 3600) / 60)
  const seconds = ttl % 60
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

// ─── 清理缓存 ───────────────────────────────────────────
const clearModalVisible = ref(false)
const clearPattern = ref('')
const clearLoading = ref(false)

const doClearCache = async (pattern?: string) => {
  clearLoading.value = true
  try {
    const res = await clearCache({ pattern })
    ElMessage.success(`清理成功，共删除 ${res.data?.deleted ?? 0} 个 key`)
    clearModalVisible.value = false
    clearPattern.value = ''
    reload()
    refresh()
  } catch (err) {
    logger.error(err)
    ElMessage.error('清理失败')
  } finally {
    clearLoading.value = false
  }
}

const handleClearCacheByPattern = async () => {
  const trimmed = clearPattern.value.trim()
  const patternVal = trimmed || '*'
  if (!trimmed) {
    await ElMessageBox.confirm(
      '您即将清空所有缓存，此操作不可恢复，是否继续？',
      '危险操作',
      {
        type: 'warning',
        confirmButtonText: '确认清空',
        cancelButtonText: '取消',
      },
    )
  }
  await doClearCache(patternVal)
}

const handleDeleteKey = (record: API.CacheKeyInfoDto) => {
  ElMessageBox.confirm(`是否确认删除缓存 key "${record.key}"？`, '系统提示', {
    type: 'warning',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
  })
    .then(async () => {
      try {
        await clearCache({ pattern: record.key })
        ElMessage.success('删除成功')
        reload()
        refresh()
      } catch (err) {
        logger.error(err)
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {})
}
</script>

<style lang="scss" scoped>
.cache-monitor {
  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
  }

  &__action-icon {
    display: inline-flex;
    align-items: center;
    margin-right: 4px;

    &.is-spin {
      animation: spin 1s linear infinite;
    }
  }

  &__auto-text {
    font-size: 13px;
  }

  &__stat-card {
    margin-bottom: 16px;

    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  &__stat-title {
    font-size: 13px;
    color: var(--gvray-color-text-secondary);
    margin-bottom: 8px;
  }

  &__stat-value {
    font-size: 24px;
    font-weight: 700;
    line-height: 1.2;
  }

  &__stat-suffix {
    font-size: 14px;
    margin-left: 2px;
  }

  &__row {
    margin-top: 0;
  }

  &__detail-card {
    margin-bottom: 16px;
  }

  &__card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__tip {
    font-size: 12px;
    color: var(--gvray-color-text-secondary);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
