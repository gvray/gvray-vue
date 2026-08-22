import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWindowSize } from '@vueuse/core'
import { debounce } from '@gvray/eskit'
import dayjs, { type Dayjs } from 'dayjs'
import type { FormInstance } from 'element-plus'
import {
  changePassword,
  deleteProfileSettings,
  queryProfileLoginLogs,
  queryProfilePermissions,
  queryProfileSettings,
  updateProfileSettings,
} from '@/api/profile'
import { LOGIN_PATH, type ThemeMode } from '@/constants'
import { useAuthStore, useSettingStore } from '@/stores'
import { logger, tokenManager } from '@/utils'
import { runtimeConfig } from '@/utils/runtime-config'
import { resetDynamicRoutes } from '@/router/utils'

// ─── Types ──────────────────────────────────────────────────────────

type AccountStatus = API.CurrentUserProfileDto['status']

const STATUS_MAP: Record<AccountStatus, { label: string; color: string }> = {
  enabled: { label: '正常', color: 'green' },
  disabled: { label: '停用', color: 'default' },
  pending: { label: '待激活', color: 'gold' },
  banned: { label: '封禁', color: 'red' },
}

export function getAccountStatusMeta(status?: AccountStatus) {
  return status ? STATUS_MAP[status] : { label: '未知', color: 'default' }
}

export type VirtualNodeType = 'DOMAIN' | 'RESOURCE' | 'ACTION'

export interface PermissionTreeNode extends API.UserPermissionSimpleDto {
  nodeType: VirtualNodeType
  isVirtual: boolean
  children?: PermissionTreeNode[]
}

export function buildPermissionTree(
  list: API.UserPermissionSimpleDto[],
): PermissionTreeNode[] {
  const domainMap = new Map<string, PermissionTreeNode>()

  for (const item of list) {
    const parts = item.code?.split(':') || []
    if (parts.length < 2) continue

    const [domain, resource] = parts
    const resourceKey = `${domain}:${resource}`

    if (!domainMap.has(domain)) {
      domainMap.set(domain, {
        permissionId: `_domain_${domain}`,
        name: domain,
        code: domain,
        nodeType: 'DOMAIN',
        isVirtual: true,
        children: [],
      })
    }
    const domainNode = domainMap.get(domain)!

    let resourceNode = domainNode.children!.find(
      (c) => c.permissionId === `_resource_${resourceKey}`,
    )
    if (!resourceNode) {
      resourceNode = {
        permissionId: `_resource_${resourceKey}`,
        name: resourceKey,
        code: resourceKey,
        nodeType: 'RESOURCE',
        isVirtual: true,
        children: [],
      }
      domainNode.children!.push(resourceNode)
    }

    resourceNode.children!.push({
      ...item,
      nodeType: 'ACTION',
      isVirtual: false,
    })
  }

  return Array.from(domainMap.values())
}

export function collectPermissionKeys(nodes: PermissionTreeNode[]): string[] {
  const keys: string[] = []
  for (const node of nodes) {
    keys.push(node.permissionId)
    if (node.children?.length) {
      keys.push(...collectPermissionKeys(node.children))
    }
  }
  return keys
}

// ─── Page model ─────────────────────────────────────────────────────

export function useProfilePageModel() {
  const authStore = useAuthStore()

  const me = computed(() => authStore.profile)
  const userProfile = computed(
    () => (me.value as any)?.profile as API.CurrentUserProfileDto | undefined,
  )

  const statusMeta = computed(() =>
    getAccountStatusMeta(userProfile.value?.status),
  )

  const completenessChecks = computed(() => [
    { key: 'avatar', label: '头像', done: !!userProfile.value?.avatar },
    { key: 'email', label: '邮箱', done: !!userProfile.value?.email },
    { key: 'phone', label: '手机', done: !!userProfile.value?.phone },
    { key: 'nickname', label: '昵称', done: !!userProfile.value?.nickname },
    { key: 'department', label: '部门', done: !!me.value?.department?.name },
    { key: 'position', label: '岗位', done: !!me.value?.positions?.[0]?.name },
  ])

  const doneCount = computed(
    () => completenessChecks.value.filter((item) => item.done).length,
  )
  const completenessPercent = computed(() =>
    Math.round((doneCount.value / completenessChecks.value.length) * 100),
  )

  const avatarSrc = computed(
    () =>
      userProfile.value?.avatar ||
      runtimeConfig.get().user.defaultAvatar ||
      __APP_DEFAULT_AVATAR_URL__ ||
      undefined,
  )

  const avatarText = computed(() => {
    const text = (userProfile.value?.nickname?.trim() ||
      me.value?.username)?.[0]
    return text || '?'
  })

  const displayName = computed(
    () => userProfile.value?.nickname || me.value?.username || '用户名',
  )

  return {
    me,
    userProfile,
    avatarSrc,
    avatarText,
    displayName,
    accountStatusLabel: computed(() => statusMeta.value.label),
    accountStatusColor: computed(() => statusMeta.value.color),
    isEnabled: computed(() => userProfile.value?.status === 'enabled'),
    completenessChecks,
    doneCount,
    completenessPercent,
  }
}

// ─── Security model ─────────────────────────────────────────────────

export function useProfileSecurityModel(
  passwordFormRef: { value?: FormInstance } | undefined,
) {
  const authStore = useAuthStore()
  const router = useRouter()
  const passwordLoading = ref(false)

  const profile = computed(() => authStore.profile)

  const handleChangePassword = async (values: {
    oldPassword: string
    newPassword: string
    confirmPassword: string
  }) => {
    try {
      passwordLoading.value = true
      const res = await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      })
      ElMessage.success(res.message || '密码修改成功，请重新登录')
      passwordFormRef?.value?.resetFields()
      tokenManager.clearTokens()
      authStore.clearAuth()
      resetDynamicRoutes()
      router.push(LOGIN_PATH)
    } catch (error) {
      logger.error(error)
    } finally {
      passwordLoading.value = false
    }
  }

  return {
    profile,
    passwordLoading,
    handleChangePassword,
  }
}

// ─── Permissions model ──────────────────────────────────────────────

export function useProfilePermissionsModel() {
  const keyword = ref('')
  const expandedKeys = ref<string[]>([])
  const loading = ref(true)
  const permData = ref<API.UserPermissionsResponseDto | null>(null)

  const fetch = async () => {
    loading.value = true
    try {
      const res = await queryProfilePermissions()
      if (res?.data) permData.value = res.data
    } catch {
      // silent
    } finally {
      loading.value = false
    }
  }

  onMounted(fetch)

  const tree = computed<PermissionTreeNode[]>(() => {
    if (!permData.value?.permissions) return []
    const kw = keyword.value.trim().toLowerCase()
    const filtered = kw
      ? permData.value.permissions.filter(
          (p) =>
            p.code?.toLowerCase().includes(kw) ||
            p.name?.toLowerCase().includes(kw),
        )
      : permData.value.permissions
    return buildPermissionTree(filtered)
  })

  watch(tree, (next) => {
    expandedKeys.value = collectPermissionKeys(next)
  })

  return {
    keyword,
    setKeyword: (v: string) => (keyword.value = v),
    expandedKeys,
    setExpandedKeys: (keys: string[]) => (expandedKeys.value = keys),
    loading,
    permData,
    tree,
  }
}

// ─── Login log model ────────────────────────────────────────────────

export type LoginLogDateRange = [Dayjs | null, Dayjs | null] | null

export function useProfileLoginLogModel() {
  const settingStore = useSettingStore()

  const data = ref<API.LoginLogResponseDto[]>([])
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const statusFilter = ref<string | undefined>(undefined)
  const dateRange = ref<LoginLogDateRange>(null)

  const fetchData = async (overrides?: Partial<API.LoginLogsFindAllParams>) => {
    loading.value = true
    try {
      const params: API.LoginLogsFindAllParams = {
        page: page.value,
        pageSize: settingStore.pageSize,
        ...overrides,
      }
      if (statusFilter.value !== undefined) {
        ;(params as any).status = statusFilter.value
      }
      if (dateRange.value?.[0]) {
        params.createdAtStart = dayjs(dateRange.value[0]).format('YYYY-MM-DD')
      }
      if (dateRange.value?.[1]) {
        params.createdAtEnd = dayjs(dateRange.value[1]).format('YYYY-MM-DD')
      }
      const res = await queryProfileLoginLogs(params)
      if (res?.data) {
        data.value = res.data.items || []
        total.value = res.data.total || 0
      }
    } catch {
      // silent
    } finally {
      loading.value = false
    }
  }

  watch(
    [
      () => page.value,
      () => settingStore.pageSize,
      () => statusFilter.value,
      () => dateRange.value,
    ],
    () => fetchData(),
    { immediate: true },
  )

  const handleSearch = () => {
    page.value = 1
    fetchData({ page: 1 })
  }

  const handleStatusChange = (value: string | undefined) => {
    statusFilter.value = value
    page.value = 1
  }

  const handleReset = () => {
    statusFilter.value = undefined
    dateRange.value = null
    page.value = 1
    fetchData({ page: 1 })
  }

  const handleSizeChange = (size: number) => {
    settingStore.setPageSize(size)
    page.value = 1
  }

  return {
    data,
    loading,
    total,
    page,
    pageSize: computed({
      get: () => settingStore.pageSize,
      set: (v: number) => settingStore.setPageSize(v),
    }),
    statusFilter,
    dateRange,
    setPage: (p: number) => (page.value = p),
    handleSearch,
    handleStatusChange,
    handleReset,
    handleSizeChange,
  }
}

// ─── Preferences model ──────────────────────────────────────────────

export function useProfilePreferencesModel() {
  const settingStore = useSettingStore()

  const {
    setTheme,
    setLanguage,
    setPageSize,
    setShowBreadcrumb,
    setSidebarCollapsed,
    setSidebarTheme,
    setShowLogo,
    setFixedHeader,
    setShowFooter,
    setColorWeak,
    setUniqueOpened,
    setEnableNotification,
    reset,
  } = settingStore

  const pendingRef = ref<Record<string, unknown>>({})

  const flushSettings = debounce(() => {
    const settings = { ...pendingRef.value }
    pendingRef.value = {}
    if (Object.keys(settings).length === 0) return
    updateProfileSettings(settings).catch(() => {
      // silent
    })
  }, 500)

  const queueSync = (patch: Record<string, unknown>) => {
    const prev = pendingRef.value
    const next: Record<string, unknown> = { ...prev }
    for (const [key, val] of Object.entries(patch)) {
      if (
        typeof val === 'object' &&
        val !== null &&
        !Array.isArray(val) &&
        typeof prev[key] === 'object' &&
        prev[key] !== null &&
        !Array.isArray(prev[key])
      ) {
        next[key] = { ...(prev[key] as Record<string, unknown>), ...val }
      } else {
        next[key] = val
      }
    }
    pendingRef.value = next
    flushSettings()
  }

  onMounted(() => {
    queryProfileSettings()
      .then((res) => {
        if (!res.data) return
        settingStore.patchSettings(res.data)
      })
      .catch(() => {
        // silent
      })
  })

  const handleThemeMode = (v: ThemeMode) => {
    setTheme(v)
    queueSync({ theme: v })
  }

  const handleLanguage = (v: string) => {
    setLanguage(v)
    queueSync({ language: v })
  }

  const handleSidebarCollapsed = (v: boolean) => {
    setSidebarCollapsed(v)
    queueSync({ sidebarCollapsed: v })
  }

  const handleFixedHeader = (v: boolean) => {
    setFixedHeader(v)
    queueSync({ fixedHeader: v })
  }

  const handleShowLogo = (v: boolean) => {
    setShowLogo(v)
    queueSync({ showLogo: v })
  }

  const handleSidebarTheme = (v: boolean) => {
    const mode = v ? 'dark' : 'light'
    setSidebarTheme(mode)
    queueSync({ sidebarTheme: mode })
  }

  const handleShowBreadcrumb = (v: boolean) => {
    setShowBreadcrumb(v)
    queueSync({ showBreadcrumb: v })
  }

  const handlePageSize = (v: number) => {
    setPageSize(v)
    queueSync({ pageSize: v })
  }

  const handleShowFooter = (v: boolean) => {
    setShowFooter(v)
    queueSync({ showFooter: v })
  }

  const handleColorWeak = (v: boolean) => {
    setColorWeak(v)
    queueSync({ colorWeak: v })
  }

  const handleUniqueOpened = (v: boolean) => {
    setUniqueOpened(v)
    queueSync({ uniqueOpened: v })
  }

  const handleEnableNotification = (v: boolean) => {
    setEnableNotification(v)
    queueSync({ enableNotification: v })
  }

  const handleReset = () => {
    reset()
    deleteProfileSettings().catch(() => {
      // silent
    })
  }

  return {
    settingStore,
    handleThemeMode,
    handleLanguage,
    handleSidebarCollapsed,
    handleFixedHeader,
    handleShowLogo,
    handleSidebarTheme,
    handleShowBreadcrumb,
    handlePageSize,
    handleShowFooter,
    handleColorWeak,
    handleUniqueOpened,
    handleEnableNotification,
    handleReset,
  }
}

// ─── Responsive helpers ─────────────────────────────────────────────

export function useProfileResponsive() {
  const { width } = useWindowSize()
  const isMd = computed(() => width.value >= 768)
  return { isMd }
}
