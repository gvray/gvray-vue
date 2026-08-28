<template>
  <PageContainer>
    <PageSkeleton v-if="loading" />

    <template v-else-if="role">
      <div class="auth-perm-page">
        <div class="auth-perm-page__layout">
          <!-- 左侧角色信息 -->
          <div class="auth-perm-page__sidebar">
            <el-card shadow="never" class="auth-perm-page__role-card">
              <div class="auth-perm-page__role-header">
                <BackButton
                  tooltip-title="返回角色列表"
                  @click="router.push('/system/role')"
                />
                <div class="auth-perm-page__role-info">
                  <div class="auth-perm-page__role-name">
                    {{ role.name }}
                  </div>
                  <span class="auth-perm-page__role-key">{{
                    role.roleKey
                  }}</span>
                </div>
                <el-dropdown
                  trigger="click"
                  placement="bottom-end"
                  @command="handleSwitchRole"
                >
                  <el-button text size="small">
                    <Icon name="SwapOutlined" />
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-for="item in roleOptions"
                        :key="item.roleId"
                        :command="item.roleId"
                        :disabled="item.roleId === roleId"
                      >
                        {{ item.name }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>

              <div class="auth-perm-page__divider" />

              <div class="auth-perm-page__info-item">
                <span class="auth-perm-page__info-label">状态</span>
                <StatusTag :value="role.status" :options="dict.common_status" />
              </div>
              <div v-if="role.remark" class="auth-perm-page__info-item">
                <span class="auth-perm-page__info-label">描述</span>
                <el-tooltip :content="role.remark" placement="top">
                  <span class="auth-perm-page__info-value">{{
                    role.remark
                  }}</span>
                </el-tooltip>
              </div>
            </el-card>

            <el-card shadow="never" class="auth-perm-page__stats-card">
              <template #header>权限概览</template>
              <div class="auth-perm-page__stats-grid">
                <div class="auth-perm-page__stat auth-perm-page__stat--primary">
                  <div class="auth-perm-page__stat-num">
                    {{ selectedPermissionIds.length }}
                  </div>
                  <div class="auth-perm-page__stat-label">已选择</div>
                </div>
                <div class="auth-perm-page__stat">
                  <div class="auth-perm-page__stat-num">
                    {{ permissions.length }}
                  </div>
                  <div class="auth-perm-page__stat-label">权限点</div>
                </div>
              </div>
              <div class="auth-perm-page__stats-divider" />
              <div class="auth-perm-page__stats-grid">
                <div class="auth-perm-page__stat auth-perm-page__stat--warning">
                  <div class="auth-perm-page__stat-num">
                    {{ stats.domains }}
                  </div>
                  <div class="auth-perm-page__stat-label">权限域</div>
                </div>
                <div class="auth-perm-page__stat auth-perm-page__stat--info">
                  <div class="auth-perm-page__stat-num">
                    {{ stats.resources }}
                  </div>
                  <div class="auth-perm-page__stat-label">资源分组</div>
                </div>
              </div>
            </el-card>

            <el-card shadow="never" class="auth-perm-page__assigned-card">
              <template #header>当前已分配</template>
              <div
                v-if="role.permissions && role.permissions.length > 0"
                class="auth-perm-page__tags"
              >
                <el-tag
                  v-for="p in role.permissions.slice(0, 12)"
                  :key="p.permissionId"
                  type="primary"
                  effect="plain"
                  size="small"
                >
                  {{ p.name }}
                </el-tag>
                <el-tag
                  v-if="role.permissions.length > 12"
                  size="small"
                  effect="plain"
                >
                  +{{ role.permissions.length - 12 }}
                </el-tag>
              </div>
              <span v-else class="auth-perm-page__empty-text">暂无权限</span>
            </el-card>
          </div>

          <!-- 右侧权限选择 -->
          <div class="auth-perm-page__main">
            <div class="auth-perm-page__action-bar">
              <el-input
                v-model="searchText"
                placeholder="搜索权限"
                clearable
                style="width: 200px"
              >
                <template #prefix><Icon name="ElSearch" /></template>
              </el-input>
              <el-button @click="handleSelectAll">全选</el-button>
              <el-button @click="handleClearAll">清空</el-button>
              <el-button @click="handleReset">
                <template #icon><Icon name="ElRefreshLeft" /></template>
                重置</el-button
              >
              <el-button
                v-hasPermi="[PERM.ROLE_UPDATE_PERMISSIONS]"
                type="primary"
                :loading="submitting"
                :disabled="!hasChanges"
                @click="handleSubmit"
              >
                <template #icon><Icon name="ElCircleCheck" /></template>
                保存
              </el-button>
            </div>

            <div class="auth-perm-page__content-body">
              <el-tree
                v-if="permissionTreeData.length > 0"
                ref="permissionTreeRef"
                :data="permissionTreeData"
                node-key="key"
                :props="{ label: 'label', children: 'children' }"
                show-checkbox
                default-expand-all
                :check-strictly="false"
                @check="onCheck"
              >
                <template #default="{ data }">
                  <span class="auth-perm-page__tree-node">
                    <Icon
                      :name="
                        data.nodeType === 'permission'
                          ? 'KeyOutlined'
                          : 'FolderOutlined'
                      "
                      class="auth-perm-page__node-icon"
                    />
                    <span class="auth-perm-page__node-name">{{
                      data.label
                    }}</span>
                    <template v-if="data.nodeType === 'permission'">
                      <el-tag
                        v-if="getActionTag(data.permission.code).label"
                        :type="getActionTag(data.permission.code).type"
                        size="small"
                        effect="light"
                      >
                        {{ getActionTag(data.permission.code).label }}
                      </el-tag>
                      <el-tag
                        v-if="data.permission.httpMethod"
                        :type="getMethodType(data.permission.httpMethod)"
                        size="small"
                        effect="light"
                      >
                        {{ data.permission.httpMethod }}
                      </el-tag>
                      <el-tooltip
                        :content="data.permission.code"
                        placement="top"
                      >
                        <span class="auth-perm-page__node-code">{{
                          data.permission.code
                        }}</span>
                      </el-tooltip>
                      <el-tooltip
                        v-if="data.permission.description"
                        :content="data.permission.description"
                        placement="top"
                      >
                        <Icon
                          name="InfoCircleOutlined"
                          class="auth-perm-page__node-info"
                        />
                      </el-tooltip>
                    </template>
                  </span>
                </template>
              </el-tree>

              <div v-else class="auth-perm-page__empty">
                <Icon name="ElFolder" class-name="auth-perm-page__empty-icon" />
                <div>暂无权限数据</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="auth-perm-page__not-found">
      <div class="auth-perm-page__empty">
        <Icon name="ElFolder" class-name="auth-perm-page__empty-icon" />
        <div>{{ roleId ? '未找到角色信息' : '请提供角色ID来分配权限' }}</div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { ElTree } from 'element-plus'
import { useI18n } from 'vue-i18n'
import {
  assignRolePermissions,
  getRoleById,
  queryRoleOptions,
} from '@/api/role'
import { queryPermissionFlat } from '@/api/permission'
import { PERM } from '@/constants/permission'
import { useDict } from '@/composables/useDict'
import { logger } from '@/utils'

const ACTION_MAP: Record<string, { label: string; type: any }> = {
  list: { label: '列表', type: 'success' },
  view: { label: '查看', type: 'success' },
  detail: { label: '详情', type: 'success' },
  create: { label: '新增', type: 'primary' },
  update: { label: '修改', type: 'warning' },
  delete: { label: '删除', type: 'danger' },
  export: { label: '导出', type: 'info' },
  import: { label: '导入', type: 'info' },
  scan: { label: '扫描', type: 'info' },
}

const METHOD_TYPE: Record<string, any> = {
  GET: 'primary',
  POST: 'success',
  PUT: 'warning',
  PATCH: 'info',
  DELETE: 'danger',
}

const getActionFromCode = (code?: string) => {
  const parts = code?.split(':').filter(Boolean) || []
  return parts[parts.length - 1] || ''
}

const getActionTag = (code?: string) => {
  const action = getActionFromCode(code)
  if (!action) return { label: '', type: 'info' }
  return ACTION_MAP[action] || { label: action, type: 'info' }
}

const getMethodType = (method?: string) => METHOD_TYPE[method || ''] || 'info'

interface TreeNode {
  key: string
  label: string
  nodeType: 'domain' | 'resource' | 'permission'
  children?: TreeNode[]
  permission?: API.PermissionResponseDto
}

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const roleId = route.params.roleId as string
const dict = useDict(['common_status'])

const loading = ref(false)
const submitting = ref(false)
const role = ref<API.RoleResponseDto | null>(null)
const roleOptions = ref<API.RoleResponseDto[]>([])
const permissions = ref<API.PermissionResponseDto[]>([])
const selectedPermissionIds = ref<string[]>([])
const originalPermissionIds = ref<string[]>([])
const searchText = ref('')
const permissionTreeRef = ref<InstanceType<typeof ElTree>>()

const permissionIdSet = computed(
  () => new Set(permissions.value.map((p) => p.permissionId)),
)

const getLabel = (id: string, fallback: string) => {
  const msg = t(id)
  return msg === id ? fallback : msg
}

const filteredPermissions = computed(() => {
  if (!searchText.value) return permissions.value
  const kw = searchText.value.toLowerCase()
  return permissions.value.filter((p) => {
    return (
      p.name?.toLowerCase().includes(kw) ||
      p.code?.toLowerCase().includes(kw) ||
      p.description?.toLowerCase().includes(kw) ||
      p.httpMethod?.toLowerCase().includes(kw)
    )
  })
})

const permissionTreeData = computed<TreeNode[]>(() => {
  const domainMap = new Map<
    string,
    { key: string; name: string; resources: Map<string, TreeNode> }
  >()

  filteredPermissions.value.forEach((permission) => {
    const parts = permission.code?.split(':').filter(Boolean) || []
    const domain = parts[0] || 'other'
    const resource = parts.length >= 2 ? parts[1] : 'default'
    const resourceKey = `${domain}:${resource}`

    if (!domainMap.has(domain)) {
      domainMap.set(domain, {
        key: `_domain_${domain}`,
        name: getLabel(`permission.domain.${domain}`, domain),
        resources: new Map(),
      })
    }

    const domainNode = domainMap.get(domain)!
    if (!domainNode.resources.has(resourceKey)) {
      domainNode.resources.set(resourceKey, {
        key: `_resource_${resourceKey}`,
        label: getLabel(`permission.resource.${resourceKey}`, resourceKey),
        nodeType: 'resource',
        children: [],
      })
    }

    domainNode.resources.get(resourceKey)!.children!.push({
      key: permission.permissionId,
      label: permission.name,
      nodeType: 'permission',
      permission,
    })
  })

  return Array.from(domainMap.values()).map((domain) => ({
    key: domain.key,
    label: domain.name,
    nodeType: 'domain' as const,
    children: Array.from(domain.resources.values()),
  }))
})

const stats = computed(() => {
  const domains = new Set<string>()
  const resources = new Set<string>()
  permissions.value.forEach((p) => {
    const parts = p.code?.split(':').filter(Boolean) || []
    const domain = parts[0] || 'other'
    const resource =
      parts.length >= 2 ? `${domain}:${parts[1]}` : `${domain}:default`
    domains.add(domain)
    resources.add(resource)
  })
  return { domains: domains.size, resources: resources.size }
})

const hasChanges = computed(() => {
  const orig = [...originalPermissionIds.value].sort()
  const curr = [...selectedPermissionIds.value].sort()
  if (orig.length !== curr.length) return true
  return orig.some((id, i) => id !== curr[i])
})

const syncTreeChecked = () => {
  nextTick(() => {
    permissionTreeRef.value?.setCheckedKeys(selectedPermissionIds.value)
  })
}

const onCheck = () => {
  const checked = permissionTreeRef.value?.getCheckedKeys() as string[]
  selectedPermissionIds.value = (checked || []).filter((key) =>
    permissionIdSet.value.has(key),
  )
}

const initializeData = async () => {
  if (!roleId) return
  loading.value = true
  try {
    const [permRes, roleRes, optionsRes] = await Promise.all([
      queryPermissionFlat({ mine: true }),
      getRoleById(roleId),
      queryRoleOptions(),
    ])
    permissions.value = permRes.data ?? []
    role.value = roleRes.data ?? null
    roleOptions.value = optionsRes.data ?? []

    const ids = role.value?.permissions?.map((p) => p.permissionId) || []
    selectedPermissionIds.value = [...ids]
    originalPermissionIds.value = [...ids]
  } catch (error) {
    logger.error(error)
  } finally {
    loading.value = false
  }
}

const handleSelectAll = () => {
  selectedPermissionIds.value = permissions.value.map((p) => p.permissionId)
  syncTreeChecked()
}

const handleClearAll = () => {
  selectedPermissionIds.value = []
  syncTreeChecked()
}

const handleReset = () => {
  selectedPermissionIds.value = [...originalPermissionIds.value]
  syncTreeChecked()
}

const handleSubmit = async () => {
  if (!role.value) return
  submitting.value = true
  try {
    await assignRolePermissions(roleId, {
      permissionIds: selectedPermissionIds.value,
    })
    ElMessage.success('权限分配成功')
    await initializeData()
  } catch (error) {
    logger.error(error)
  } finally {
    submitting.value = false
  }
}

const handleSwitchRole = (targetRoleId: string) => {
  if (targetRoleId === roleId) return
  router.push(`/system/role-auth/permission/${targetRoleId}`)
}

// 树数据变化(加载/搜索)后重新应用勾选状态
watch(permissionTreeData, () => {
  syncTreeChecked()
})

onMounted(initializeData)
</script>

<style lang="scss" scoped>
.auth-perm-page {
  &__layout {
    display: flex;
    gap: 16px;
    align-items: flex-start;

    @media (max-width: 1200px) {
      flex-direction: column;
    }
  }

  &__sidebar {
    width: 280px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;

    @media (max-width: 1200px) {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: stretch;
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  &__role-card,
  &__stats-card {
    height: 100%;
  }

  &__assigned-card {
    @media (max-width: 1200px) {
      grid-column: 1 / -1;
    }
  }

  &__role-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__role-info {
    flex: 1;
    min-width: 0;
  }

  &__role-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--gvray-color-text-heading, var(--el-text-color-primary));
    margin-bottom: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__role-key {
    font-size: 12px;
    color: var(--gvray-color-primary, var(--el-color-primary));
    background: var(--gvray-color-primary-bg, var(--el-color-primary-light-9));
    padding: 2px 8px;
    border-radius: 4px;
    display: inline-block;
    font-family: 'SF Mono', Monaco, monospace;
  }

  &__divider {
    border-top: 1px solid var(--gvray-color-border, var(--el-border-color));
    margin: 16px 0;
  }

  &__info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    font-size: 13px;
  }

  &__info-label {
    color: var(--gvray-color-text-secondary, var(--el-text-color-secondary));
  }

  &__info-value {
    max-width: 150px;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--gvray-color-text-heading, var(--el-text-color-primary));
    font-weight: 500;
  }

  &__stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  &__stats-divider {
    border-top: 1px solid var(--gvray-color-border, var(--el-border-color));
    margin: 10px 0;
  }

  &__stat {
    background: var(
      --gvray-color-fill-quaternary,
      var(--el-fill-color-lighter)
    );
    border: 1px solid var(--gvray-color-border, var(--el-border-color));
    border-radius: 8px;
    padding: 10px 8px;
    text-align: center;

    &--primary {
      background: var(
        --gvray-color-primary-bg,
        var(--el-color-primary-light-9)
      );
      border-color: var(
        --gvray-color-primary-border,
        var(--el-color-primary-light-5)
      );

      .auth-perm-page__stat-num {
        color: var(--gvray-color-primary, var(--el-color-primary));
      }
    }

    &--warning {
      background: var(
        --gvray-color-warning-bg,
        var(--el-color-warning-light-9)
      );
      border-color: var(
        --gvray-color-warning-border,
        var(--el-color-warning-light-5)
      );

      .auth-perm-page__stat-num {
        color: var(--gvray-color-warning, var(--el-color-warning));
      }
    }

    &--info {
      background: var(--gvray-color-info-bg, var(--el-color-info-light-9));
      border-color: var(
        --gvray-color-info-border,
        var(--el-color-info-light-5)
      );

      .auth-perm-page__stat-num {
        color: var(--gvray-color-info, var(--el-color-info));
      }
    }
  }

  &__stat-num {
    font-size: 20px;
    font-weight: 600;
    color: var(--gvray-color-text-heading, var(--el-text-color-primary));
    line-height: 1;
    margin-bottom: 4px;
  }

  &__stat-label {
    font-size: 11px;
    color: var(--gvray-color-text-secondary, var(--el-text-color-secondary));
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  &__empty-text {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__main {
    flex: 1;
    min-width: 0;
    background: var(--gvray-color-bg-container, var(--el-bg-color));
    border: 1px solid var(--gvray-color-border, var(--el-border-color));
    border-radius: 8px;
    overflow: hidden;

    @media (max-width: 1200px) {
      width: 100%;
    }
  }

  &__action-bar {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--gvray-color-border, var(--el-border-color));
    flex-wrap: wrap;
    box-sizing: border-box;
  }

  &__content-body {
    padding: 8px 16px;

    :deep(.el-tree) {
      background: transparent;
    }

    :deep(.el-tree-node__content) {
      padding: 4px 0;
    }

    :deep(.el-tree-node__label) {
      padding: 2px 4px;
    }
  }

  &__tree-node {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  &__node-icon {
    color: var(--gvray-color-primary, var(--el-color-primary));
  }

  &__node-name {
    font-size: 13px;
    color: var(--gvray-color-text, var(--el-text-color-primary));
  }

  &__node-code {
    font-size: 11px;
    padding: 1px 6px;
    border-radius: 3px;
    background: var(--gvray-color-primary-bg, var(--el-color-primary-light-9));
    color: var(--gvray-color-primary, var(--el-color-primary));
    font-family: 'SF Mono', Monaco, monospace;
  }

  &__node-info {
    color: var(
      --gvray-color-text-placeholder,
      var(--el-text-color-placeholder)
    );
    font-size: 12px;
    cursor: help;
  }

  &__empty {
    text-align: center;
    color: var(--gvray-color-text-secondary, var(--el-text-color-secondary));
    padding: 60px 20px;
  }

  &__empty-icon {
    font-size: 48px;
    color: var(--gvray-color-text-disabled, var(--el-text-color-disabled));
    margin-bottom: 16px;
    opacity: 0.3;
  }

  &__not-found {
    padding: 40px 0;
  }
}
</style>
