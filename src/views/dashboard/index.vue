<template>
  <div class="dashboard-page">
    <!-- 欢迎栏 -->
    <div class="dashboard-page__welcome">
      <div class="dashboard-page__welcome-left">
        <h4 class="dashboard-page__welcome-title">欢迎回来 👋</h4>
        <span class="dashboard-page__welcome-subtitle"
          >这是你的系统运行概览，祝你工作愉快</span
        >
      </div>
      <div class="dashboard-page__time">
        <Icon name="ClockCircleOutlined" />
        {{ currentTime }}
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-top: 16px; row-gap: 16px">
      <el-col
        v-for="stat in statConfig"
        :key="stat.key"
        :xs="24"
        :sm="12"
        :lg="6"
      >
        <div class="stat-card" :style="{ background: stat.gradient }">
          <div class="stat-card__icon">
            <Icon :name="stat.icon" :size="48" />
          </div>
          <div class="stat-card__label">{{ stat.label }}</div>
          <div class="stat-card__value">{{ getStatValue(stat.key) }}</div>
          <div class="stat-card__trend">
            <Icon
              :name="stat.trendUp ? 'ArrowUpOutlined' : 'ArrowDownOutlined'"
              :size="10"
            />
            {{ stat.trendValue }} {{ stat.trendLabel }}
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表 -->
    <el-row :gutter="16" style="margin-top: 16px; row-gap: 16px">
      <el-col :xs="24" :lg="14">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <span class="chart-card__title">登录趋势</span>
          </template>
          <LoginTrend :data="loginData" :height="340" />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="10">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <span class="chart-card__title">角色分布</span>
          </template>
          <RoleDistribution :data="roleDistribution" :height="340" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近动态 -->
    <el-row :gutter="16" style="margin-top: 16px; row-gap: 16px">
      <el-col :span="24">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <span class="chart-card__title">最近动态</span>
          </template>
          <ActivityTimeline :logs="logs" :loading="loading" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { format } from '@gvray/datekit'
import ActivityTimeline from './components/ActivityTimeline.vue'
import LoginTrend from './components/LoginTrend.vue'
import RoleDistribution from './components/RoleDistribution.vue'
import { useDashboard } from './composables/useDashboard'

interface StatItem {
  key: string
  label: string
  icon: string
  gradient: string
  trendUp: boolean
  trendValue: string
  trendLabel: string
}

const statConfig: StatItem[] = [
  {
    key: 'users',
    label: '用户总数',
    icon: 'UserOutlined',
    gradient:
      'linear-gradient(135deg, var(--gvray-color-primary) 0%, var(--gvray-color-info) 100%)',
    trendUp: true,
    trendValue: '+12%',
    trendLabel: '较上月',
  },
  {
    key: 'roles',
    label: '角色数量',
    icon: 'TeamOutlined',
    gradient:
      'linear-gradient(135deg, var(--gvray-color-error) 0%, var(--gvray-color-warning) 100%)',
    trendUp: true,
    trendValue: '+2',
    trendLabel: '本月新增',
  },
  {
    key: 'permissions',
    label: '权限点数',
    icon: 'SafetyCertificateOutlined',
    gradient:
      'linear-gradient(135deg, var(--gvray-color-info) 0%, var(--gvray-color-primary-hover) 100%)',
    trendUp: true,
    trendValue: '+5',
    trendLabel: '本月新增',
  },
  {
    key: 'onlineUsers',
    label: '在线用户',
    icon: 'WifiOutlined',
    gradient:
      'linear-gradient(135deg, var(--gvray-color-success) 0%, var(--gvray-color-primary) 100%)',
    trendUp: false,
    trendValue: '-3',
    trendLabel: '较昨日',
  },
]

const { overview, roleDistribution, loginData, logs, fetchDashboardData } =
  useDashboard()
const loading = ref(true)
const currentTime = ref(format(new Date(), 'YYYY年MM月DD日 dddd HH:mm'))

let timer: ReturnType<typeof setInterval> | null = null

function getStatValue(key: string): number {
  if (!overview.value) return 0
  return (overview.value[key] as number) ?? 0
}

onMounted(async () => {
  loading.value = true
  try {
    await fetchDashboardData()
  } catch {
    // 全局 errorHandler 已提示
  } finally {
    loading.value = false
  }

  timer = setInterval(() => {
    currentTime.value = format(new Date(), 'YYYY年MM月DD日 dddd HH:mm')
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style lang="scss" scoped>
.dashboard-page {
  padding: 0 24px 24px;
  min-height: 100%;

  &__welcome {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28px 0 20px;
  }

  &__welcome-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__welcome-title {
    margin: 0;
    font-weight: 600;
    font-size: 20px;
    color: var(--gvray-color-text);
  }

  &__welcome-subtitle {
    font-size: 13px;
    color: var(--gvray-color-text-secondary);
  }

  &__time {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--gvray-color-text-secondary);
    font-size: 13px;
  }
}

.stat-card {
  position: relative;
  border-radius: 12px;
  padding: 20px 24px;
  color: #fff;
  overflow: hidden;
  cursor: default;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--gvray-shadow-secondary);
  }

  &__icon {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 48px;
    opacity: 0.18;
    line-height: 1;
  }

  &__label {
    font-size: 13px;
    opacity: 0.85;
    margin-bottom: 8px;
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  &__value {
    font-size: 32px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.5px;
  }

  &__trend {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 10px;
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(4px);
  }
}

.chart-card__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--gvray-color-text);
}
</style>
