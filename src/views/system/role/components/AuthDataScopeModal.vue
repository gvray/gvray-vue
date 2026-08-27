<template>
  <el-dialog
    :model-value="visible"
    width="600px"
    :close-on-click-modal="false"
    destroy-on-close
    @update:model-value="(v: boolean) => !v && emit('cancel')"
  >
    <template #header>
      <div class="data-scope-modal__header">
        <Icon name="DatabaseOutlined" class="data-scope-modal__header-icon" />
        <span>数据权限分配 - {{ currentRole?.name || roleName }}</span>
        <el-tag
          v-if="currentRole?.roleKey"
          type="primary"
          effect="plain"
          size="small"
        >
          {{ currentRole.roleKey }}
        </el-tag>
      </div>
    </template>

    <div v-loading="loading" class="data-scope-modal__body">
      <div class="data-scope-modal__section-title">选择数据权限类型：</div>
      <el-radio-group
        v-model="dataScope"
        class="data-scope-modal__group"
        @change="onScopeChange"
      >
        <template v-for="type in permissionTypes" :key="type.value">
          <el-radio
            :value="type.value"
            class="data-scope-modal__option"
            :class="{ 'is-selected': dataScope === type.value }"
          >
            <Icon
              :name="type.icon"
              class="data-scope-modal__option-icon"
              :style="{ color: type.color }"
            />
            <div class="data-scope-modal__option-content">
              <div class="data-scope-modal__option-title">
                {{ type.label }}
              </div>
              <div class="data-scope-modal__option-desc">
                {{ type.description }}
              </div>
            </div>
          </el-radio>

          <div
            v-if="
              type.value === DataScope.CUSTOM && dataScope === DataScope.CUSTOM
            "
            class="data-scope-modal__dept"
          >
            <div class="data-scope-modal__dept-header">
              <span>选择允许访问的部门：</span>
              <el-tag v-if="selectedDeptIds.length" type="primary" size="small">
                已选 {{ selectedDeptIds.length }} 个部门
              </el-tag>
            </div>
            <div class="data-scope-modal__tree">
              <el-tree
                ref="deptTreeRef"
                :data="departments"
                :props="{ label: 'name', children: 'children' }"
                node-key="departmentId"
                show-checkbox
                default-expand-all
                :check-strictly="false"
                @check="handleDeptCheck"
              >
                <template #default="{ data }">
                  <el-space :size="6">
                    <span>{{ data.name }}</span>
                    <el-tag
                      v-if="data.description"
                      type="info"
                      size="small"
                      effect="plain"
                    >
                      {{ data.description }}
                    </el-tag>
                  </el-space>
                </template>
              </el-tree>
            </div>
          </div>
        </template>
      </el-radio-group>
    </div>

    <template #footer>
      <el-button @click="handleReset">重置</el-button>
      <el-button @click="emit('cancel')">取消</el-button>
      <AuthButton
        type="primary"
        :loading="submitting"
        :perms="[PERM.ROLE_UPDATE_DATA_SCOPE]"
        @click="handleSubmit"
      >
        保存分配
      </AuthButton>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { ElTree } from 'element-plus'
import { queryDepartmentTree } from '@/api/department'
import {
  assignRoleDataScopes,
  getRoleById,
  getRoleDataScopesById,
} from '@/api/role'
import { PERM } from '@/constants/permission'
import { logger } from '@/utils'

enum DataScope {
  SELF = 1,
  DEPARTMENT = 2,
  DEPARTMENT_AND_CHILD = 3,
  CUSTOM = 4,
  ALL = 5,
}

interface PermissionType {
  value: DataScope
  label: string
  description: string
  icon: string
  color: string
}

const permissionTypes: PermissionType[] = [
  {
    value: DataScope.ALL,
    label: '全部数据权限',
    description: '可以访问所有数据，不受任何限制',
    icon: 'DatabaseOutlined',
    color: 'var(--gvray-color-success)',
  },
  {
    value: DataScope.DEPARTMENT,
    label: '本部门数据权限',
    description: '只能访问当前用户所在部门的数据',
    icon: 'TeamOutlined',
    color: 'var(--gvray-color-warning)',
  },
  {
    value: DataScope.DEPARTMENT_AND_CHILD,
    label: '本部门及以下数据权限',
    description: '可以访问当前用户所在部门及其下级部门的数据',
    icon: 'TeamOutlined',
    color: 'var(--gvray-color-info)',
  },
  {
    value: DataScope.CUSTOM,
    label: '自定义数据权限',
    description: '可以自定义访问特定部门的数据',
    icon: 'EyeOutlined',
    color: 'var(--gvray-color-primary)',
  },
  {
    value: DataScope.SELF,
    label: '仅本人数据权限',
    description: '只能访问自己创建或负责的数据',
    icon: 'EyeOutlined',
    color: 'var(--gvray-color-error)',
  },
]

interface Props {
  visible: boolean
  roleId: string
  roleName: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  cancel: []
  success: []
}>()

const deptTreeRef = ref<InstanceType<typeof ElTree>>()
const currentRole = ref<API.RoleResponseDto | null>(null)
const departments = ref<API.DepartmentResponseDto[]>([])
const dataScope = ref<DataScope>(DataScope.SELF)
const selectedDeptIds = ref<string[]>([])
const loading = ref(false)
const submitting = ref(false)

const initializeData = async () => {
  loading.value = true
  try {
    const [roleRes, dataScopesRes, departmentsRes] = await Promise.all([
      getRoleById(props.roleId),
      getRoleDataScopesById(props.roleId),
      queryDepartmentTree(),
    ])
    currentRole.value = roleRes.data ?? null
    departments.value = departmentsRes.data ?? []

    if (dataScopesRes.data) {
      dataScope.value = dataScopesRes.data.dataScope as DataScope
      selectedDeptIds.value =
        dataScopesRes.data.dataScope === DataScope.CUSTOM
          ? (dataScopesRes.data.departments ?? []).map((d) => d.departmentId)
          : []
      syncTreeChecked()
    }
  } catch (error) {
    logger.error(error)
  } finally {
    loading.value = false
  }
}

const syncTreeChecked = () => {
  nextTick(() => {
    deptTreeRef.value?.setCheckedKeys(selectedDeptIds.value)
  })
}

const onScopeChange = (value: DataScope) => {
  if (value !== DataScope.CUSTOM) {
    selectedDeptIds.value = []
  } else {
    syncTreeChecked()
  }
}

const handleDeptCheck = () => {
  selectedDeptIds.value = deptTreeRef.value?.getCheckedKeys() as string[]
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    const payload: { dataScope: number; departmentIds?: string[] } = {
      dataScope: dataScope.value,
    }
    if (dataScope.value === DataScope.CUSTOM) {
      payload.departmentIds = selectedDeptIds.value
    }
    await assignRoleDataScopes(props.roleId, payload as any)
    ElMessage.success('数据权限分配成功')
    emit('success')
    emit('cancel')
  } catch (error) {
    logger.error(error)
  } finally {
    submitting.value = false
  }
}

const handleReset = () => {
  dataScope.value = DataScope.SELF
  selectedDeptIds.value = []
  syncTreeChecked()
}

watch(
  () => [props.visible, props.roleId],
  ([vis, id]) => {
    if (vis && id) initializeData()
  },
)
</script>

<style lang="scss" scoped>
.data-scope-modal {
  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__header-icon {
    color: var(--gvray-color-primary, var(--el-color-primary));
    font-size: 18px;
  }

  &__body {
    max-height: 500px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  &__section-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  &__group {
    display: block;
    width: 100%;
  }

  &__option {
    display: flex;
    align-items: center;
    width: 100%;
    height: auto;
    padding: 12px 16px;
    border: 1px solid var(--gvray-color-border, var(--el-border-color));
    border-radius: 6px;
    margin-bottom: 12px;
    margin-right: 0;
    box-sizing: border-box;
    cursor: pointer;
    transition: all 0.3s;
    background: var(--gvray-color-bg-container, var(--el-bg-color));

    &:hover {
      border-color: var(--gvray-color-primary, var(--el-color-primary));
      background: var(--gvray-color-bg-text-hover, var(--el-fill-color-light));
    }

    &.is-selected {
      border-color: var(--gvray-color-primary, var(--el-color-primary));
      background: var(
        --gvray-color-primary-bg,
        var(--el-color-primary-light-9)
      );
    }

    :deep(.el-radio__input) {
      order: 2;
      flex-shrink: 0;
      margin-left: auto;
    }

    :deep(.el-radio__label) {
      order: 1;
      flex: 1;
      min-width: 0;
      padding-left: 12px;
      white-space: normal;
      overflow: hidden;
      word-break: break-word;
    }
  }

  &__option-icon {
    margin-right: 12px;
    font-size: 16px;
    flex-shrink: 0;
    color: var(--gvray-color-primary, var(--el-color-primary));
  }

  &__option-content {
    flex: 1;
    min-width: 0;
  }

  &__option-title {
    font-weight: 500;
    font-size: 14px;
    margin-bottom: 4px;
    color: var(--gvray-color-text, var(--el-text-color-primary));
  }

  &__option-desc {
    font-size: 12px;
    color: var(--gvray-color-text-secondary, var(--el-text-color-secondary));
    line-height: 1.4;
  }

  &__dept {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--gvray-color-border, var(--el-border-color));
  }

  &__dept-header {
    margin-bottom: 12px;
    font-weight: 500;
  }

  &__tree {
    max-height: 300px;
    overflow: auto;
    border: 1px solid var(--gvray-color-border, var(--el-border-color));
    border-radius: 6px;
    padding: 12px;
    background: var(--gvray-color-bg-layout, var(--el-fill-color-lighter));

    :deep(.el-tree-node__content) {
      overflow: hidden;
    }
  }
}
</style>
