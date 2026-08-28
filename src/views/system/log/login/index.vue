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
          class="login-log__search-form"
          @submit.prevent="onSearch"
        >
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="登陆账号" prop="account">
                <el-input
                  v-model="searchParams.account"
                  placeholder="请输入登陆账号"
                  clearable
                  @keyup.enter="onSearch"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="IP地址" prop="ipAddress">
                <el-input
                  v-model="searchParams.ipAddress"
                  placeholder="请输入IP地址"
                  clearable
                  @keyup.enter="onSearch"
                />
              </el-form-item>
            </el-col>
            <el-col v-show="searchExpanded" :span="8">
              <el-form-item label="登录状态" prop="result">
                <el-select
                  v-model="searchParams.result"
                  placeholder="请选择状态"
                  clearable
                  style="width: 100%"
                >
                  <el-option label="成功" value="success" />
                  <el-option label="失败" value="failure" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col v-show="searchExpanded" :span="8">
              <el-form-item label="登录时间">
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
          v-hasPermi="[PERM.LOG_LOGIN_DELETE]"
          type="danger"
          :disabled="selectedIds.length === 0"
          :loading="deleting"
          @click="handleDelete"
        >
          <template #icon><Icon name="ElDelete" /></template>
          删除
        </el-button>
        <el-button
          v-hasPermi="[PERM.LOG_LOGIN_CLEAR]"
          type="danger"
          :loading="clearing"
          @click="handleClear"
        >
          清空
        </el-button>
      </template>

      <el-table
        v-loading="loading"
        :data="list"
        row-key="id"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="访问编号" prop="id" width="100">
          <template #default="{ row }">
            <CopyId :id="row.id" />
          </template>
        </el-table-column>
        <el-table-column label="登陆账号" prop="account" min-width="120" />
        <el-table-column label="IP地址" prop="ipAddress" min-width="130" />
        <el-table-column label="登录地点" prop="location" min-width="120">
          <template #default="{ row }">{{ row.location || '-' }}</template>
        </el-table-column>
        <el-table-column label="浏览器" prop="browser" min-width="100">
          <template #default="{ row }">{{ row.browser || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作系统" prop="os" min-width="100">
          <template #default="{ row }">{{ row.os || '-' }}</template>
        </el-table-column>
        <el-table-column label="登录状态" prop="status" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 1 ? 'success' : 'danger'"
              size="small"
            >
              {{ row.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="登录类型" prop="loginType" min-width="100" />
        <el-table-column label="操作信息" prop="failReason" min-width="140">
          <template #default="{ row }">{{
            row.failReason || '登陆成功'
          }}</template>
        </el-table-column>
        <el-table-column label="登录时间" prop="createdAt" min-width="160">
          <template #default="{ row }">
            <DateTimeFormat :value="row.createdAt" />
          </template>
        </el-table-column>
      </el-table>
    </TablePro>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  queryLoginLogList,
  batchDeleteLoginLogs,
  clearLoginLog,
} from '@/api/loginLog'
import { useTablePage } from '@/composables/useTablePage'
import { useSearchForm } from '@/composables/useSearchForm'
import { PERM } from '@/constants/permission'
import { logger } from '@/utils'

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
} = useTablePage<API.LoginLogResponseDto>(queryLoginLogList)

const { searchExpanded, searchParams, dateRange, onSearch, onReset } =
  useSearchForm(
    {
      account: undefined as string | undefined,
      ipAddress: undefined as string | undefined,
      result: undefined as string | undefined,
    },
    handleSearch,
    handleReset,
  )

// ─── 选择与批量操作 ───────────────────────────────────────
const selectedRows = ref<API.LoginLogResponseDto[]>([])
const selectedIds = computed(() => selectedRows.value.map((r) => r.id))
const handleSelectionChange = (rows: API.LoginLogResponseDto[]) => {
  selectedRows.value = rows
}

const deleting = ref(false)
const clearing = ref(false)

const handleDelete = () => {
  if (!selectedIds.value.length) return
  ElMessageBox.confirm(
    `是否确认删除选中的 ${selectedIds.value.length} 条登录日志？此操作不可恢复！`,
    '系统提示',
    { type: 'warning', confirmButtonText: '确认', cancelButtonText: '取消' },
  )
    .then(async () => {
      deleting.value = true
      await batchDeleteLoginLogs({ ids: selectedIds.value })
      ElMessage.success('删除成功')
      selectedRows.value = []
      reload()
    })
    .catch((error) => logger.error(error))
    .finally(() => {
      deleting.value = false
    })
}

const handleClear = () => {
  ElMessageBox.confirm(
    '是否确认清理所有登录日志？此操作不可恢复！',
    '系统提示',
    { type: 'warning', confirmButtonText: '确认', cancelButtonText: '取消' },
  )
    .then(async () => {
      clearing.value = true
      await clearLoginLog()
      ElMessage.success('清理成功')
      reload()
    })
    .catch((error) => logger.error(error))
    .finally(() => {
      clearing.value = false
    })
}
</script>
