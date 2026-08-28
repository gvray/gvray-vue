<template>
  <PageContainer>
    <div class="server-monitor">
      <!-- ── 顶部工具栏 ── -->
      <div class="server-monitor__toolbar">
        <span class="server-monitor__title">服务监控</span>
        <el-space>
          <span v-if="data" class="server-monitor__time">
            数据更新时间：<DateTimeFormat :value="data.timestamp" />
          </span>
          <el-link :underline="false" @click="fetchData">
            <span
              class="server-monitor__action-icon"
              :class="{ 'is-spin': loading }"
            >
              <Icon name="ReloadOutlined" />
            </span>
            刷新
          </el-link>
          <el-space :size="4">
            <span class="server-monitor__auto-text">自动刷新</span>
            <el-switch v-model="autoRefresh" size="small" />
          </el-space>
        </el-space>
      </div>

      <!-- ── 第一行：概览卡片 ── -->
      <el-row :gutter="16">
        <el-col
          v-for="card in overviewCards"
          :key="card.key"
          :xs="24"
          :sm="12"
          :lg="6"
        >
          <el-card v-loading="loading" class="server-monitor__overview-card">
            <div class="server-monitor__card-header">
              <span class="server-monitor__card-icon">
                <Icon :name="card.icon" />
              </span>
              <span class="server-monitor__card-title">{{ card.title }}</span>
            </div>
            <template v-if="card.isText">
              <div class="server-monitor__card-text-wrap">
                <div class="server-monitor__card-text-value">
                  {{ card.value }}
                </div>
                <div v-if="card.sub" class="server-monitor__card-text-sub">
                  {{ card.sub }}
                </div>
              </div>
            </template>
            <template v-else>
              <Charts :options="card.option" :height="160" />
            </template>
          </el-card>
        </el-col>
      </el-row>

      <!-- ── 第二行：CPU 详情 + 内存详情 ── -->
      <el-row :gutter="16" class="server-monitor__row">
        <el-col :xs="24" :lg="16">
          <el-card v-loading="loading" class="server-monitor__detail-card">
            <template #header>CPU 监控</template>
            <template v-if="data">
              <!-- 负载均衡 -->
              <el-row :gutter="16" class="server-monitor__load-row">
                <el-col v-for="item in loadItems" :key="item.label" :span="8">
                  <div class="server-monitor__load-item">
                    <div class="server-monitor__load-label">
                      {{ item.label }}
                    </div>
                    <div class="server-monitor__load-value">
                      {{ item.value.toFixed(2) }}
                    </div>
                  </div>
                </el-col>
              </el-row>
              <!-- 核心数 -->
              <div class="server-monitor__core-info">
                <span class="server-monitor__sub-text">
                  逻辑核心：{{ data.cpu.cores }} | 物理核心：{{
                    data.cpu.physicalCores
                  }}
                </span>
              </div>
              <!-- 每核心使用率柱状图 -->
              <Charts :options="cpuBarOption" :height="220" />
            </template>
          </el-card>
        </el-col>
        <el-col :xs="24" :lg="8">
          <el-card v-loading="loading" class="server-monitor__detail-card">
            <template #header>内存监控</template>
            <template v-if="data">
              <Charts :options="memoryPieOption" :height="260" />
              <div class="server-monitor__memory-legend">
                <div class="server-monitor__memory-item">
                  <span
                    class="server-monitor__memory-dot"
                    style="background: #f5576c"
                  />
                  <span>已用：{{ formatBytes(data.memory.used) }}</span>
                </div>
                <div class="server-monitor__memory-item">
                  <span
                    class="server-monitor__memory-dot"
                    style="background: #43e97b"
                  />
                  <span>空闲：{{ formatBytes(data.memory.free) }}</span>
                </div>
                <div class="server-monitor__memory-item">
                  <span
                    class="server-monitor__memory-dot"
                    style="background: #999"
                  />
                  <span>总计：{{ formatBytes(data.memory.total) }}</span>
                </div>
              </div>
            </template>
          </el-card>
        </el-col>
      </el-row>

      <!-- ── 第三行：磁盘监控 ── -->
      <el-row :gutter="16" class="server-monitor__row">
        <el-col :span="24">
          <el-card v-loading="loading" class="server-monitor__detail-card">
            <template #header>磁盘监控</template>
            <template v-if="data">
              <el-table :data="data.disk" size="small" border>
                <el-table-column label="挂载点" prop="mount" />
                <el-table-column label="文件系统" prop="fsType" width="120" />
                <el-table-column label="总容量" width="120">
                  <template #default="{ row }">
                    {{ formatBytes(row.total) }}
                  </template>
                </el-table-column>
                <el-table-column label="已用" width="120">
                  <template #default="{ row }">
                    {{ formatBytes(row.used) }}
                  </template>
                </el-table-column>
                <el-table-column label="空闲" width="120">
                  <template #default="{ row }">
                    {{ formatBytes(row.free) }}
                  </template>
                </el-table-column>
                <el-table-column label="使用率" width="180">
                  <template #default="{ row }">
                    <el-progress
                      :percentage="Math.round(row.usagePercent)"
                      :stroke-width="14"
                      :color="getUsageColor(row.usagePercent)"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-card>
        </el-col>
      </el-row>

      <!-- ── 第四行：网络监控 ── -->
      <el-row :gutter="16" class="server-monitor__row">
        <el-col :span="24">
          <el-card v-loading="loading" class="server-monitor__detail-card">
            <template #header>网络监控</template>
            <template v-if="data">
              <el-table :data="data.network" size="small" border>
                <el-table-column label="接口" prop="iface" width="120" />
                <el-table-column label="IPv4" prop="ip4" width="160" />
                <el-table-column label="MAC" prop="mac" width="160" />
                <el-table-column label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag
                      :type="row.operstate === 'up' ? 'success' : 'danger'"
                      size="small"
                    >
                      {{ row.operstate === 'up' ? 'UP' : 'DOWN' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="接收" width="120">
                  <template #default="{ row }">
                    {{ formatBytes(row.rxBytes) }}
                  </template>
                </el-table-column>
                <el-table-column label="发送" width="120">
                  <template #default="{ row }">
                    {{ formatBytes(row.txBytes) }}
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-card>
        </el-col>
      </el-row>

      <!-- ── 第五行：Node 进程监控 ── -->
      <el-row :gutter="16" class="server-monitor__row">
        <el-col :span="24">
          <el-card v-loading="loading" class="server-monitor__detail-card">
            <template #header>Node 进程监控</template>
            <template v-if="data">
              <el-row :gutter="16">
                <el-col
                  v-for="item in processItems"
                  :key="item.label"
                  :xs="24"
                  :sm="12"
                  :md="8"
                  :lg="6"
                >
                  <div class="server-monitor__process-item">
                    <div class="server-monitor__process-label">
                      {{ item.label }}
                    </div>
                    <div class="server-monitor__process-value">
                      <template v-if="item.type === 'progress'">
                        <el-progress
                          :percentage="item.percent"
                          :stroke-width="14"
                          :color="item.color"
                          :format="() => `${item.percent}%`"
                        />
                        <div class="server-monitor__process-sub">
                          {{ item.sub }}
                        </div>
                      </template>
                      <template v-else-if="item.type === 'tag'">
                        <el-tag :color="item.color" effect="dark" size="small">
                          {{ item.value }}
                        </el-tag>
                      </template>
                      <template v-else>
                        {{ item.value }}
                      </template>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </template>
          </el-card>
        </el-col>
      </el-row>

      <!-- 错误空状态 -->
      <el-empty
        v-if="error && !data"
        :description="error"
        class="server-monitor__empty"
      >
        <el-link :underline="false" @click="fetchData">
          <span
            class="server-monitor__action-icon"
            :class="{ 'is-spin': loading }"
          >
            <Icon name="ReloadOutlined" />
          </span>
          重新加载
        </el-link>
      </el-empty>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { EChartsOption } from 'echarts'
import { queryServerMetrics } from '@/api/monitor'
import { useChartToken } from '@/composables/useChartToken'
import { formatBytes, formatUptime, getUsageColor } from '@/utils'
import { logger } from '@/utils'

const { token } = useChartToken()

// ─── 数据获取 ───────────────────────────────────────────
const data = ref<API.ServerMetricsResponseDto | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const autoRefresh = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await queryServerMetrics()
    if (res.data) {
      data.value = res.data
    } else {
      error.value = '暂无监控数据'
    }
  } catch (err) {
    logger.error(err)
    error.value = '获取监控数据失败，请检查后端服务'
  } finally {
    loading.value = false
  }
}

const startTimer = () => {
  timer = setInterval(fetchData, 5000)
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

onMounted(fetchData)
onUnmounted(stopTimer)

// ─── ECharts 配置工厂 ───────────────────────────────────

/** 环形仪表盘（CPU / 内存使用率） */
const createGaugeOption = (value: number, name: string): EChartsOption => {
  const color = getUsageColor(value)
  const t = token.value
  return {
    series: [
      {
        type: 'gauge',
        startAngle: 90,
        endAngle: -270,
        radius: '90%',
        pointer: { show: false },
        progress: {
          show: true,
          overlap: false,
          roundCap: true,
          clip: false,
          itemStyle: { color },
        },
        axisLine: {
          lineStyle: { width: 10, color: [[1, t.colorFillSecondary]] },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        data: [
          {
            value: Math.round(value),
            name,
            title: {
              offsetCenter: ['0%', '-20%'],
              fontSize: 12,
              color: t.colorTextSecondary,
            },
            detail: {
              offsetCenter: ['0%', '15%'],
              fontSize: 28,
              fontWeight: 700,
              color,
              formatter: '{value}%',
            },
          },
        ],
        detail: { valueAnimation: true },
      },
    ],
  }
}

/** CPU 每核心使用率柱状图 */
const createCpuBarOption = (perCore: number[]): EChartsOption => {
  const t = token.value
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: unknown) => {
        const list = params as { name: string; value: number }[]
        if (!Array.isArray(list) || list.length === 0) return ''
        const item = list[0]
        return `核心 ${item.name}: ${item.value}%`
      },
    },
    grid: { left: 8, right: 8, bottom: 24, top: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: perCore.map((_, i) => `#${i + 1}`),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: t.colorTextSecondary, fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: t.colorTextSecondary,
        fontSize: 10,
        formatter: '{value}%',
      },
      splitLine: {
        lineStyle: { color: t.colorFillSecondary, type: 'dashed' },
      },
    },
    series: [
      {
        type: 'bar',
        data: perCore.map((v) => ({
          value: v,
          itemStyle: { color: getUsageColor(v), borderRadius: [3, 3, 0, 0] },
        })),
        barWidth: '60%',
      },
    ],
  }
}

/** 内存饼图 */
const createMemoryPieOption = (used: number, free: number): EChartsOption => {
  const t = token.value
  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: unknown) => {
        const p = params as { name: string; value: number; percent: number }
        return `${p.name}: ${formatBytes(p.value)} (${p.percent}%)`
      },
    },
    legend: {
      orient: 'vertical',
      right: 16,
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      icon: 'circle',
      textStyle: { fontSize: 12, color: t.colorTextSecondary },
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: t.colorBgContainer,
          borderWidth: 3,
        },
        label: { show: false },
        labelLine: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 6,
          itemStyle: { shadowBlur: 16 },
        },
        data: [
          {
            value: used,
            name: '已用',
            itemStyle: { color: '#f5576c' },
          },
          {
            value: free,
            name: '空闲',
            itemStyle: { color: '#43e97b' },
          },
        ],
      },
    ],
  }
}

// ─── 派生数据 ───────────────────────────────────────────

const overviewCards = computed(() => {
  if (!data.value) return []
  const d = data.value
  return [
    {
      key: 'cpu',
      title: 'CPU 使用率',
      icon: 'DashboardOutlined',
      value: d.cpu.usagePercent,
      option: createGaugeOption(d.cpu.usagePercent, 'CPU'),
    },
    {
      key: 'memory',
      title: '内存使用率',
      icon: 'DashboardOutlined',
      value: d.memory.usagePercent,
      option: createGaugeOption(d.memory.usagePercent, '内存'),
    },
    {
      key: 'osUptime',
      title: '系统运行时间',
      icon: 'FieldTimeOutlined',
      value: formatUptime(d.os.uptime),
      isText: true,
      sub: `${d.os.platform} · ${d.os.arch}`,
    },
    {
      key: 'processUptime',
      title: 'Node 进程运行时间',
      icon: 'NodeIndexOutlined',
      value: formatUptime(d.process.uptime),
      isText: true,
      sub: `PID: ${d.process.pid}`,
    },
  ]
})

const loadItems = computed(() => {
  if (!data.value) return []
  const c = data.value.cpu
  return [
    { label: '1 分钟负载', value: c.loadAverage1m },
    { label: '5 分钟负载', value: c.loadAverage5m },
    { label: '15 分钟负载', value: c.loadAverage15m },
  ]
})

const cpuBarOption = computed(() =>
  data.value ? createCpuBarOption(data.value.cpu.perCoreUsage) : {},
)

const memoryPieOption = computed(() =>
  data.value
    ? createMemoryPieOption(data.value.memory.used, data.value.memory.free)
    : {},
)

const processItems = computed(() => {
  if (!data.value) return []
  const p = data.value.process
  const heapPercent = Math.round((p.heapUsed / Math.max(p.heapTotal, 1)) * 100)
  return [
    { label: 'PID', value: String(p.pid) },
    { label: 'Node 版本', value: p.nodeVersion },
    {
      label: '进程 CPU',
      type: 'tag' as const,
      value: `${p.cpuPercent.toFixed(1)}%`,
      color: getUsageColor(p.cpuPercent),
    },
    { label: 'RSS', value: formatBytes(p.rss) },
    {
      label: '堆内存',
      type: 'progress' as const,
      percent: heapPercent,
      color: getUsageColor(heapPercent),
      sub: `${formatBytes(p.heapUsed)} / ${formatBytes(p.heapTotal)}`,
    },
    { label: 'External', value: formatBytes(p.external) },
  ]
})
</script>

<style lang="scss" scoped>
.server-monitor {
  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }

  &__time {
    font-size: 12px;
    color: var(--gvray-color-text-secondary);
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

  &__overview-card {
    margin-bottom: 16px;

    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  &__card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  &__card-icon {
    font-size: 18px;
    color: var(--gvray-color-primary);
  }

  &__card-title {
    font-size: 14px;
    color: var(--gvray-color-text-secondary);
  }

  &__card-text-wrap {
    height: 160px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  &__card-text-value {
    font-size: 22px;
    font-weight: 700;
  }

  &__card-text-sub {
    font-size: 12px;
    color: var(--gvray-color-text-secondary);
    margin-top: 4px;
  }

  &__detail-card {
    margin-bottom: 16px;
  }

  &__row {
    margin-top: 0;

    .el-col {
      margin-bottom: 16px;
    }
  }

  &__load-row {
    margin-bottom: 16px;
  }

  &__load-item {
    text-align: center;
  }

  &__load-label {
    font-size: 12px;
    color: var(--gvray-color-text-secondary);
    margin-bottom: 4px;
  }

  &__load-value {
    font-size: 20px;
    font-weight: 600;
  }

  &__core-info {
    margin-bottom: 12px;
    text-align: center;
  }

  &__sub-text {
    font-size: 13px;
    color: var(--gvray-color-text-secondary);
  }

  &__memory-legend {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 12px;
  }

  &__memory-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
  }

  &__memory-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__process-item {
    border: 1px solid var(--gvray-color-border);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
  }

  &__process-label {
    font-size: 12px;
    color: var(--gvray-color-text-secondary);
    margin-bottom: 8px;
  }

  &__process-value {
    font-size: 16px;
    font-weight: 600;
  }

  &__process-sub {
    font-size: 12px;
    color: var(--gvray-color-text-secondary);
    margin-top: 4px;
  }

  &__empty {
    margin-top: 48px;
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
