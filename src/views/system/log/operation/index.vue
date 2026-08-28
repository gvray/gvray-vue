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
          class="operation-log__search-form"
          @submit.prevent="onSearch"
        >
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="用户" prop="username">
                <el-input
                  v-model="searchParams.username"
                  placeholder="请输入用户名"
                  clearable
                  @keyup.enter="onSearch"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="操作" prop="action">
                <el-input
                  v-model="searchParams.action"
                  placeholder="请输入操作"
                  clearable
                  @keyup.enter="onSearch"
                />
              </el-form-item>
            </el-col>
            <el-col v-show="searchExpanded" :span="8">
              <el-form-item label="模块" prop="module">
                <el-input
                  v-model="searchParams.module"
                  placeholder="请输入模块"
                  clearable
                  @keyup.enter="onSearch"
                />
              </el-form-item>
            </el-col>
            <el-col v-show="searchExpanded" :span="8">
              <el-form-item label="结果" prop="result">
                <el-select
                  v-model="searchParams.result"
                  placeholder="请选择结果"
                  clearable
                  style="width: 100%"
                >
                  <el-option label="成功" value="success" />
                  <el-option label="失败" value="failure" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col v-show="searchExpanded" :span="8">
              <el-form-item label="时间">
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
          v-hasPermi="[PERM.LOG_OPERATION_DELETE]"
          type="danger"
          :disabled="selectedIds.length === 0"
          :loading="deleting"
          @click="handleDelete"
        >
          <template #icon><Icon name="ElDelete" /></template>
          删除
        </el-button>
        <el-button
          v-hasPermi="[PERM.LOG_OPERATION_CLEAR]"
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
        <el-table-column label="用户" prop="username" min-width="120" />
        <el-table-column label="操作" prop="action" min-width="120" />
        <el-table-column label="模块" prop="module" min-width="120" />
        <el-table-column label="方法" prop="method" width="80">
          <template #default="{ row }">
            <el-tag
              :type="methodTagType(String(row.method ?? ''))"
              size="small"
            >
              {{ row.method || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="结果" prop="result" width="80">
          <template #default="{ row }">
            <el-tag
              :type="row.result === 'success' ? 'success' : 'danger'"
              size="small"
            >
              {{ row.result === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="资源"
          prop="resource"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column label="IP地址" prop="ipAddress" min-width="130" />
        <el-table-column
          label="路径"
          prop="path"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column label="耗时" prop="latencyMs" width="90">
          <template #default="{ row }">
            {{ row.latencyMs ? `${row.latencyMs} ms` : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="时间" prop="createdAt" min-width="160">
          <template #default="{ row }">
            <DateTimeFormat :value="row.createdAt" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              v-hasPermi="[PERM.LOG_OPERATION_VIEW]"
              type="primary"
              link
              size="small"
              @click="handleViewDetail(row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </TablePro>

    <LogDetailModal
      v-model:visible="detailVisible"
      :log-id="viewingLogId"
      @close="handleCloseDetail"
    />
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  queryOperationLogList,
  batchDeleteOperationLogs,
  clearOperationLog,
} from '@/api/operationLog'
import { useTablePage } from '@/composables/useTablePage'
import { useSearchForm } from '@/composables/useSearchForm'
import { PERM } from '@/constants/permission'
import { logger } from '@/utils'
import { methodTagType } from './util'
import LogDetailModal from './components/LogDetailModal.vue'

type OperationLogRow = Record<string, any>

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
} = useTablePage<OperationLogRow>(queryOperationLogList)

const { searchExpanded, searchParams, dateRange, onSearch, onReset } =
  useSearchForm(
    {
      username: undefined as string | undefined,
      action: undefined as string | undefined,
      module: undefined as string | undefined,
      result: undefined as string | undefined,
    },
    handleSearch,
    handleReset,
  )

// ─── 选择与批量操作 ───────────────────────────────────────
const selectedRows = ref<OperationLogRow[]>([])
const selectedIds = computed(() => selectedRows.value.map((r) => r.id))
const handleSelectionChange = (rows: OperationLogRow[]) => {
  selectedRows.value = rows
}

const deleting = ref(false)
const clearing = ref(false)

const handleDelete = () => {
  if (!selectedIds.value.length) return
  ElMessageBox.confirm(
    `是否确认删除选中的 ${selectedIds.value.length} 条操作日志？此操作不可恢复！`,
    '系统提示',
    { type: 'warning', confirmButtonText: '确认', cancelButtonText: '取消' },
  )
    .then(async () => {
      deleting.value = true
      await batchDeleteOperationLogs({ ids: selectedIds.value as number[] })
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
    '是否确认清空所有操作日志？此操作不可恢复！',
    '系统提示',
    { type: 'warning', confirmButtonText: '确认', cancelButtonText: '取消' },
  )
    .then(async () => {
      clearing.value = true
      await clearOperationLog()
      ElMessage.success('清空成功')
      reload()
    })
    .catch((error) => logger.error(error))
    .finally(() => {
      clearing.value = false
    })
}

// ─── 详情 ─────────────────────────────────────────────────
const detailVisible = ref(false)
const viewingLogId = ref<number | string | undefined>(undefined)

const handleViewDetail = (row: OperationLogRow) => {
  viewingLogId.value = row.id
  detailVisible.value = true
}

const handleCloseDetail = () => {
  detailVisible.value = false
}
</script>
