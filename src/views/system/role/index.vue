<template>
  <PageContainer>
    <TablePro
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="total"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    >
      <template #search>
        <el-form
          :model="searchParams"
          class="role-page__search-form"
          @submit.prevent="onSearch"
        >
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="角色名称" prop="name">
                <el-input
                  v-model="searchParams.name"
                  placeholder="请输入角色名称"
                  clearable
                  @keyup.enter="onSearch"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="角色标识" prop="roleKey">
                <el-input
                  v-model="searchParams.roleKey"
                  placeholder="请输入角色标识"
                  clearable
                  @keyup.enter="onSearch"
                />
              </el-form-item>
            </el-col>
            <el-col v-show="searchExpanded" :span="8">
              <el-form-item label="状态" prop="status">
                <el-select
                  v-model="searchParams.status"
                  placeholder="请选择状态"
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in dict.common_status"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col v-show="searchExpanded" :span="8">
              <el-form-item label="创建时间">
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  value-format="YYYY-MM-DD"
                  range-separator="-"
                  start-placeholder="开始"
                  end-placeholder="结束"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="searchExpanded ? 16 : 8">
              <SearchActions
                v-model:expanded="searchExpanded"
                @search="onSearch"
                @reset="onReset"
              />
            </el-col>
          </el-row>
        </el-form>
      </template>

      <template #toolbar>
        <el-button
          v-hasPermi="[PERM.ROLE_CREATE]"
          type="primary"
          @click="handleAdd"
        >
          新增角色
        </el-button>
      </template>

      <el-table
        v-loading="loading"
        :data="list"
        style="width: 100%"
        row-key="roleId"
      >
        <el-table-column label="角色编号" prop="roleId" width="120">
          <template #default="{ row }">
            <CopyId :id="row.roleId" />
          </template>
        </el-table-column>
        <el-table-column label="角色名称" prop="name" min-width="140" />
        <el-table-column label="角色标识" prop="roleKey" min-width="160" />
        <el-table-column label="状态" prop="status" width="100">
          <template #default="{ row }">
            <StatusTag :value="row.status" :options="dict.common_status" />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createdAt" min-width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-space :size="0">
              <el-button
                v-hasPermi="[PERM.ROLE_UPDATE]"
                type="primary"
                link
                size="small"
                :icon="Edit"
                @click="handleEdit(row)"
              >
                修改
              </el-button>
              <el-button
                v-hasPermi="[PERM.ROLE_DELETE]"
                type="danger"
                link
                size="small"
                :icon="Delete"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
              <el-dropdown
                v-if="
                  hasAnyPerm([
                    PERM.ROLE_UPDATE_PERMISSIONS,
                    PERM.ROLE_UPDATE_DATA_SCOPE,
                    PERM.ROLE_UPDATE_USERS,
                  ])
                "
                trigger="click"
                @command="handleMoreCommand($event, row)"
              >
                <el-button type="primary" link size="small">
                  <template #icon><Icon name="MoreVerticalIcon" /></template>
                  更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      v-hasPermi="[PERM.ROLE_UPDATE_PERMISSIONS]"
                      command="permission"
                      :icon="Key"
                    >
                      分配权限
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-hasPermi="[PERM.ROLE_UPDATE_DATA_SCOPE]"
                      command="dataPermission"
                      :icon="Coin"
                    >
                      数据权限
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-hasPermi="[PERM.ROLE_UPDATE_USERS]"
                      command="user"
                      :icon="User"
                    >
                      分配用户
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </TablePro>

    <!-- 角色表单弹窗 -->
    <RoleForm ref="roleFormRef" :dict="dict" :on-ok="handleFormOk" />

    <!-- 数据权限弹窗 -->
    <AuthDataScopeModal
      v-if="currentRole"
      :visible="dataScopeVisible"
      :role-id="currentRole.roleId"
      :role-name="currentRole.name || ''"
      @cancel="handleDataScopeCancel"
      @success="handleDataScopeSuccess"
    />
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowDown,
  Coin,
  Delete,
  Edit,
  Key,
  User,
} from '@element-plus/icons-vue'
import { queryRoleList, deleteRole } from '@/api/role'
import { useAuthStore } from '@/stores'
import { useDict } from '@/composables/useDict'
import { useTablePage } from '@/composables/useTablePage'
import { PERM } from '@/constants/permission'
import RoleForm from './RoleForm.vue'
import AuthDataScopeModal from './components/AuthDataScopeModal.vue'

const router = useRouter()
const authStore = useAuthStore()

const hasAnyPerm = (perms: string[]) => {
  const p = authStore.permissions
  if (p.includes('*:*:*')) return true
  return perms.some((perm) => p.includes(perm))
}

const dict = useDict(['common_status'])

// ─── 列表 ─────────────────────────────────────────────────
const {
  loading,
  list,
  total,
  page,
  pageSize,
  handleSearch,
  handleReset,
  handlePageChange,
  handleSizeChange,
  reload,
} = useTablePage<API.RoleResponseDto>(queryRoleList)

// ─── 搜索表单 ─────────────────────────────────────────────
const searchExpanded = ref(false)
const searchParams = reactive({
  name: undefined as string | undefined,
  roleKey: undefined as string | undefined,
  status: undefined as string | undefined,
})
const dateRange = ref<[string, string] | null>(null)

const buildParams = () => {
  const params: API.RolesFindAllParams = Object.fromEntries(
    Object.entries(searchParams).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  ) as API.RolesFindAllParams
  if (dateRange.value?.[0]) params.createdAtStart = dateRange.value[0]
  if (dateRange.value?.[1]) params.createdAtEnd = dateRange.value[1]
  return params
}

const onSearch = () => handleSearch(buildParams())

const onReset = () => {
  Object.assign(searchParams, {
    name: undefined,
    roleKey: undefined,
    status: undefined,
  })
  dateRange.value = null
  handleReset()
}

// ─── 日期格式化 ───────────────────────────────────────────
const formatDate = (val: string) => {
  if (!val) return ''
  return new Date(val).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// ─── 增删改 ───────────────────────────────────────────────
const roleFormRef = ref<InstanceType<typeof RoleForm>>()

const handleAdd = () => roleFormRef.value?.show('添加角色')
const handleEdit = (row: API.RoleResponseDto) =>
  roleFormRef.value?.show('修改角色', row.roleId)
const handleFormOk = () => reload()

const handleDelete = (row: API.RoleResponseDto) => {
  ElMessageBox.confirm(
    `是否确认删除角色编号为"${row.roleId}"的数据项？`,
    '系统提示',
    {
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
    },
  )
    .then(async () => {
      await deleteRole(row.roleId)
      ElMessage.success('删除成功')
      reload()
    })
    .catch(() => {})
}

// ─── 更多操作 ─────────────────────────────────────────────
const currentRole = ref<API.RoleResponseDto | null>(null)
const dataScopeVisible = ref(false)

const handleMoreCommand = (command: string, row: API.RoleResponseDto) => {
  if (command === 'permission') {
    router.push(`/system/role-auth/permission/${row.roleId}`)
  } else if (command === 'user') {
    router.push(`/system/role-auth/user/${row.roleId}`)
  } else if (command === 'dataPermission') {
    currentRole.value = row
    dataScopeVisible.value = true
  }
}

const handleDataScopeCancel = () => {
  dataScopeVisible.value = false
}

const handleDataScopeSuccess = () => {
  reload()
}
</script>
