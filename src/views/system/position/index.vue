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
          class="position-page__search-form"
          @submit.prevent="onSearch"
        >
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="岗位编码" prop="code">
                <el-input
                  v-model="searchParams.code"
                  placeholder="请输入岗位编码"
                  clearable
                  @keyup.enter="onSearch"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="岗位名称" prop="name">
                <el-input
                  v-model="searchParams.name"
                  placeholder="请输入岗位名称"
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
          v-hasPermi="[PERM.POSITION_CREATE]"
          type="primary"
          @click="handleAdd"
        >
          新增岗位
        </el-button>
      </template>

      <el-table
        v-loading="loading"
        :data="list"
        style="width: 100%"
        row-key="positionId"
      >
        <el-table-column label="岗位编号" prop="positionId" width="120">
          <template #default="{ row }">
            <CopyId :id="row.positionId" />
          </template>
        </el-table-column>
        <el-table-column label="岗位编码" prop="code" min-width="160" />
        <el-table-column label="岗位名称" prop="name" min-width="160" />
        <el-table-column label="状态" prop="status" width="100">
          <template #default="{ row }">
            <StatusTag :value="row.status" :options="dict.common_status" />
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="sort" width="100" />
        <el-table-column label="创建时间" prop="createdAt" min-width="160">
          <template #default="{ row }">
            <DateTimeFormat :value="row.createdAt" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-space :size="0">
              <el-button
                v-hasPermi="[PERM.POSITION_UPDATE]"
                type="primary"
                link
                size="small"
                @click="handleEdit(row as API.PositionResponseDto)"
              >
                <template #icon><Icon name="ElEdit" /></template>
                修改
              </el-button>
              <el-button
                v-hasPermi="[PERM.POSITION_DELETE]"
                type="danger"
                link
                size="small"
                @click="handleDelete(row as API.PositionResponseDto)"
              >
                <template #icon><Icon name="ElDelete" /></template>
                删除
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </TablePro>

    <!-- 岗位表单弹窗 -->
    <PositionForm ref="positionFormRef" :dict="dict" :on-ok="handleFormOk" />
  </PageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { queryPositionList, deletePosition } from '@/api/position'
import { useDict } from '@/composables/useDict'
import { useTablePage } from '@/composables/useTablePage'
import { useSearchForm } from '@/composables/useSearchForm'
import { PERM } from '@/constants/permission'
import PositionForm from './PositionForm.vue'

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
} = useTablePage<API.PositionResponseDto>(queryPositionList)

// ─── 搜索表单 ─────────────────────────────────────────────
const { searchExpanded, searchParams, dateRange, onSearch, onReset } =
  useSearchForm(
    {
      code: undefined as string | undefined,
      name: undefined as string | undefined,
      status: undefined as string | undefined,
    },
    handleSearch,
    handleReset,
  )

// ─── 增删改 ───────────────────────────────────────────────
const positionFormRef = ref<InstanceType<typeof PositionForm>>()

const handleAdd = () => positionFormRef.value?.show('添加岗位')
const handleEdit = (row: API.PositionResponseDto) =>
  positionFormRef.value?.show('修改岗位', row.positionId)
const handleFormOk = () => reload()

const handleDelete = (row: API.PositionResponseDto) => {
  ElMessageBox.confirm(`是否确认删除岗位“${row.name}”？`, '系统提示', {
    type: 'warning',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
  })
    .then(async () => {
      await deletePosition(row.positionId)
      ElMessage.success('删除成功')
      reload()
    })
    .catch(() => {})
}
</script>
