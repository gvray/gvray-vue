import {
  queryDashboardOverview,
  queryLoginTrend,
  queryRoleDistribution,
} from '@/api/dashboard'

export interface ActivityLog {
  time: string
  user: string
  action: string
  status: string
  ip: string
}

export function useDashboard() {
  const overview = ref<Record<string, unknown> | null>(null)
  const roleDistribution = ref<Record<string, unknown> | null>(null)
  const loginData = ref<{ date: string; value: number }[]>([])
  const logs = ref<ActivityLog[]>([])

  async function fetchOverview() {
    try {
      const res = await queryDashboardOverview()
      if (res.data) {
        overview.value = res.data
      }
    } catch {
      // 全局 errorHandler 已提示
    }
  }

  async function fetchRoleDistribution() {
    try {
      const res = await queryRoleDistribution()
      if (res.data) {
        roleDistribution.value = res.data
      }
    } catch {
      // 全局 errorHandler 已提示
    }
  }

  async function fetchLoginTrend() {
    try {
      const res = await queryLoginTrend()
      if (res.data) {
        loginData.value = res.data as unknown as {
          date: string
          value: number
        }[]
      }
    } catch {
      // 全局 errorHandler 已提示
    }
  }

  async function fetchDashboardData() {
    await Promise.all([
      fetchOverview(),
      fetchRoleDistribution(),
      fetchLoginTrend(),
    ])
  }

  logs.value = [
    {
      time: '2025-10-13 09:21',
      user: 'admin',
      action: '删除角色',
      status: '成功',
      ip: '192.168.1.5',
    },
    {
      time: '2025-10-13 09:20',
      user: 'user1',
      action: '登录系统',
      status: '成功',
      ip: '192.168.1.23',
    },
    {
      time: '2025-10-13 09:18',
      user: 'admin',
      action: '新增用户 zhangsan',
      status: '成功',
      ip: '192.168.1.5',
    },
    {
      time: '2025-10-13 09:15',
      user: 'user2',
      action: '修改权限配置',
      status: '失败',
      ip: '192.168.1.8',
    },
    {
      time: '2025-10-13 09:10',
      user: 'admin',
      action: '更新系统配置',
      status: '成功',
      ip: '192.168.1.5',
    },
    {
      time: '2025-10-13 09:05',
      user: 'user3',
      action: '登录系统',
      status: '成功',
      ip: '10.0.0.12',
    },
  ]

  return {
    overview,
    roleDistribution,
    loginData,
    logs,
    fetchDashboardData,
  }
}
