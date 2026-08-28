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
          class="notice-page__search-form"
          @submit.prevent="onSearch"
        >
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="标题" prop="title">
                <el-input
                  v-model="searchParams.title"
                  placeholder="请输入标题"
                  clearable
                  @keyup.enter="onSearch"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="类型" prop="type">
                <el-select
                  v-model="searchParams.type"
                  placeholder="请选择类型"
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in noticeTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
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
                    v-for="item in statusOptions"
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
          v-hasPermi="[PERM.NOTICE_CREATE]"
          type="primary"
          @click="handleAdd"
        >
          新增通知公告
        </el-button>
        <el-button
          v-hasPermi="[PERM.NOTICE_DELETE]"
          type="danger"
          :disabled="!selectedIds.length"
          @click="handleBatchDelete"
        >
          批量删除
        </el-button>
      </template>

      <el-table
        v-loading="loading"
        :data="list"
        style="width: 100%"
        row-key="noticeId"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="44" />
        <el-table-column label="标题" prop="title" min-width="280" />
        <el-table-column label="类型" prop="type" width="120">
          <template #default="{ row }">
            <el-tag>{{ noticeTypeMap[row.type] || row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status" width="100">
          <template #default="{ row }">
            <StatusTag :value="row.status" :options="statusOptions" />
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="sort" width="80" />
        <el-table-column label="创建时间" prop="createdAt" min-width="160">
          <template #default="{ row }">
            <DateTimeFormat :value="row.createdAt" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-space :size="0">
              <el-button
                v-hasPermi="[PERM.NOTICE_VIEW]"
                type="primary"
                link
                size="small"
                @click="handleView(row as API.NoticeResponseDto)"
              >
                <template #icon><Icon name="ElView" /></template>
                查看
              </el-button>
              <el-button
                v-hasPermi="[PERM.NOTICE_UPDATE]"
                type="primary"
                link
                size="small"
                @click="handleEdit(row as API.NoticeResponseDto)"
              >
                <template #icon><Icon name="ElEdit" /></template>
                修改
              </el-button>
              <el-button
                v-hasPermi="[PERM.NOTICE_DELETE]"
                type="danger"
                link
                size="small"
                @click="handleDelete(row as API.NoticeResponseDto)"
              >
                <template #icon><Icon name="ElDelete" /></template>
                删除
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </TablePro>

    <NoticeForm ref="noticeFormRef" :on-ok="handleFormOk" />
    <NoticeDetailModal
      v-if="currentNotice"
      v-model:visible="detailVisible"
      :notice="currentNotice"
    />
  </PageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  queryNoticeList,
  getNoticeById,
  deleteNotice,
  batchDeleteNotices,
} from '@/api/notice'
import { useTablePage } from '@/composables/useTablePage'
import { useSearchForm } from '@/composables/useSearchForm'
import { PERM } from '@/constants/permission'
import { logger } from '@/utils'
import NoticeForm from './NoticeForm.vue'
import NoticeDetailModal from './components/NoticeDetailModal.vue'

const noticeTypeMap: Record<string, string> = {
  notice: '通知',
  announcement: '通告',
}
const noticeTypeOptions = [
  { label: '通知', value: 'notice' },
  { label: '通告', value: 'announcement' },
]
const statusOptions = [
  { label: '启用', value: 'enabled' },
  { label: '禁用', value: 'disabled' },
]

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
} = useTablePage<API.NoticeResponseDto>(queryNoticeList)

const { searchExpanded, searchParams, dateRange, onSearch, onReset } =
  useSearchForm(
    {
      title: undefined as string | undefined,
      type: undefined as string | undefined,
      status: undefined as string | undefined,
    },
    handleSearch,
    handleReset,
  )

const noticeFormRef = ref<InstanceType<typeof NoticeForm>>()
const detailVisible = ref(false)
const currentNotice = ref<API.NoticeResponseDto>()
const selectedIds = ref<string[]>([])

const handleAdd = () => noticeFormRef.value?.show('添加通知公告')
const handleEdit = (row: API.NoticeResponseDto) =>
  noticeFormRef.value?.show('修改通知公告', row.noticeId)
const handleFormOk = () => reload()

const handleSelectionChange = (selection: API.NoticeResponseDto[]) => {
  selectedIds.value = selection.map((r) => r.noticeId)
}

const handleView = async (row: API.NoticeResponseDto) => {
  try {
    const { data } = await getNoticeById(row.noticeId)
    currentNotice.value = data
    detailVisible.value = true
  } catch (error) {
    logger.error(error)
  }
}

const handleDelete = (row: API.NoticeResponseDto) => {
  ElMessageBox.confirm(`是否确认删除通知公告“${row.title}”？`, '系统提示', {
    type: 'warning',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
  })
    .then(async () => {
      await deleteNotice(row.noticeId)
      ElMessage.success('删除成功')
      reload()
    })
    .catch(() => {})
}

const handleBatchDelete = () => {
  if (!selectedIds.value.length) return
  ElMessageBox.confirm(
    `确认删除选中的 ${selectedIds.value.length} 条记录？`,
    '批量删除确认',
    { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
  )
    .then(async () => {
      await batchDeleteNotices({ ids: selectedIds.value })
      selectedIds.value = []
      ElMessage.success('选中的通知公告已删除')
      reload()
    })
    .catch(() => {})
}
</script>
