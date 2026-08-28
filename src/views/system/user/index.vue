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
          class="user-page__search-form"
          @submit.prevent="onSearch"
        >
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="登陆账号" prop="username">
                <el-input
                  v-model="searchParams.username"
                  placeholder="请输入登陆账号"
                  clearable
                  @keyup.enter="onSearch"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="用户名称" prop="nickname">
                <el-input
                  v-model="searchParams.nickname"
                  placeholder="请输入用户名称"
                  clearable
                  @keyup.enter="onSearch"
                />
              </el-form-item>
            </el-col>
            <el-col v-show="searchExpanded" :span="8">
              <el-form-item label="手机号码" prop="phone">
                <el-input
                  v-model="searchParams.phone"
                  placeholder="请输入手机号码"
                  clearable
                  @keyup.enter="onSearch"
                />
              </el-form-item>
            </el-col>
            <el-col v-show="searchExpanded" :span="8">
              <el-form-item label="用户状态" prop="status">
                <el-select
                  v-model="searchParams.status"
                  placeholder="请选择状态"
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in dict.user_status"
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
            <SearchActions
              v-model:expanded="searchExpanded"
              @search="onSearch"
              @reset="onReset"
            />
          </el-row>
        </el-form>
      </template>

      <template #toolbar>
        <el-button
          v-hasPermi="[PERM.USER_CREATE]"
          type="primary"
          @click="handleAdd"
        >
          新增用户
        </el-button>
      </template>

      <el-table
        v-loading="loading"
        :data="list"
        style="width: 100%"
        row-key="userId"
      >
        <el-table-column label="用户编号" prop="userId" width="120">
          <template #default="{ row }">
            <CopyId :id="row.userId" />
          </template>
        </el-table-column>
        <el-table-column label="登陆账号" prop="username" min-width="140" />
        <el-table-column label="用户名称" prop="nickname" min-width="140" />
        <el-table-column label="手机号码" prop="phone" min-width="140" />
        <el-table-column label="状态" prop="status" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createdAt" min-width="160">
          <template #default="{ row }">
            <DateTimeFormat :value="row.createdAt" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-space :size="0">
              <el-button
                v-hasPermi="[PERM.USER_UPDATE]"
                type="primary"
                link
                size="small"
                @click="handleEdit(row)"
              >
                <template #icon><Icon name="ElEdit" /></template>
                修改
              </el-button>
              <el-button
                v-hasPermi="[PERM.USER_DELETE]"
                type="danger"
                link
                size="small"
                @click="handleDelete(row)"
              >
                <template #icon><Icon name="ElDelete" /></template>
                删除
              </el-button>
              <el-dropdown
                v-if="moreActions.length"
                trigger="click"
                @command="handleMoreCommand($event, row)"
              >
                <el-button type="primary" link size="small">
                  <template #icon><Icon name="MoreVerticalIcon" /></template>
                  更多<Icon name="ElArrowDown" class-name="el-icon--right" />
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      v-for="action in moreActions"
                      :key="action.command"
                      :command="action.command"
                    >
                      <template #icon><Icon :name="action.icon" /></template>
                      {{ action.label }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </TablePro>

    <!-- 用户表单弹窗 -->
    <UserForm ref="userFormRef" :dict="dict" :on-ok="handleFormOk" />

    <!-- 重置密码弹窗 -->
    <el-dialog
      v-model="resetPwdVisible"
      title="重置密码"
      width="400px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="resetPwdFormRef"
        :model="resetPwdForm"
        :rules="resetPwdRules"
        label-width="80px"
      >
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="resetPwdForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="resetPwdForm.confirmPassword"
            type="password"
            placeholder="请确认新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetPwdVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="resetPwdLoading"
          @click="handleResetPwdConfirm"
        >
          确认
        </el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { queryUserList, deleteUser, resetUserPassword } from '@/api/user'
import { useDict } from '@/composables/useDict'
import { useTablePage } from '@/composables/useTablePage'
import { useSearchForm } from '@/composables/useSearchForm'
import { usePermission } from '@/composables/usePermission'
import { PERM } from '@/constants/permission'
import type { IconKey } from '@/components/Icon/map'
import { logger } from '@/utils'
import UserForm from './UserForm.vue'

const router = useRouter()

const dict = useDict(['user_status', 'user_gender'])

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
} = useTablePage<API.UserResponseDto>(queryUserList)

// ─── 搜索表单 ─────────────────────────────────────────────
const { searchExpanded, searchParams, dateRange, onSearch, onReset } =
  useSearchForm(
    {
      username: undefined as string | undefined,
      nickname: undefined as string | undefined,
      phone: undefined as string | undefined,
      status: undefined as string | undefined,
    },
    handleSearch,
    handleReset,
  )

// ─── 状态展示 ─────────────────────────────────────────────
const statusTagTypeMap: Record<string, string> = {
  enabled: 'success',
  disabled: 'danger',
  pending: 'warning',
  banned: 'danger',
}
const statusTagType = (status: string) =>
  (statusTagTypeMap[status] || 'info') as any
const statusLabel = (status: string) =>
  dict.user_status?.find((i) => i.value === status)?.label || status
// ─── 增删改 ───────────────────────────────────────────────
const userFormRef = ref<InstanceType<typeof UserForm>>()

const handleAdd = () => userFormRef.value?.show('添加用户')
const handleEdit = (row: any) =>
  userFormRef.value?.show('修改用户', (row as API.UserResponseDto).userId)
const handleFormOk = () => reload()

const handleDelete = (row: any) => {
  const user = row as API.UserResponseDto
  ElMessageBox.confirm(
    `是否确认删除用户编号为"${user.userId}"的数据项？`,
    '系统提示',
    {
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
    },
  )
    .then(async () => {
      await deleteUser(user.userId)
      ElMessage.success('删除成功')
      reload()
    })
    .catch(() => {})
}

// ─── 更多操作 ─────────────────────────────────────────────
const { hasPermission } = usePermission()

const moreActions = computed(() => {
  const items: {
    command: string
    label: string
    icon: IconKey
    perm: string
  }[] = [
    {
      command: 'authRole',
      label: '分配角色',
      icon: 'ElUser',
      perm: PERM.USER_UPDATE_ROLES,
    },
    {
      command: 'resetPassword',
      label: '重置密码',
      icon: 'ElKey',
      perm: PERM.USER_RESET_PASSWORD,
    },
  ]
  return items.filter((a) => hasPermission([a.perm]))
})

const handleMoreCommand = (command: string, row: any) => {
  const user = row as API.UserResponseDto
  if (command === 'authRole')
    router.push(`/system/user-auth/role/${user.userId}`)
  else if (command === 'resetPassword') openResetPwd(user)
}

// ─── 重置密码 ─────────────────────────────────────────────
const resetPwdVisible = ref(false)
const resetPwdLoading = ref(false)
const resetPwdUserId = ref<string | null>(null)
const resetPwdFormRef = ref<FormInstance>()
const resetPwdForm = reactive({ newPassword: '', confirmPassword: '' })

const resetPwdRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_: unknown, val: string, cb: (e?: Error) => void) => {
        if (!val || val === resetPwdForm.newPassword) cb()
        else cb(new Error('两次输入的密码不一致'))
      },
      trigger: 'blur',
    },
  ],
}

const openResetPwd = (row: API.UserResponseDto) => {
  resetPwdUserId.value = row.userId
  resetPwdForm.newPassword = ''
  resetPwdForm.confirmPassword = ''
  resetPwdVisible.value = true
}

const handleResetPwdConfirm = async () => {
  const valid = await resetPwdFormRef.value?.validate().catch(() => false)
  if (!valid || !resetPwdUserId.value) return

  resetPwdLoading.value = true
  try {
    await resetUserPassword(resetPwdUserId.value, {
      newPassword: resetPwdForm.newPassword,
    })
    ElMessage.success('重置密码成功')
    resetPwdVisible.value = false
  } catch (error) {
    logger.error(error)
  } finally {
    resetPwdLoading.value = false
  }
}
</script>
