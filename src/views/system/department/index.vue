<template>
  <PageContainer>
    <div class="dept-page">
      <div class="dept-page__search">
        <el-form
          :model="searchParams"
          class="dept-page__search-form"
          @submit.prevent="onSearch"
        >
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="部门名称" prop="name">
                <el-input
                  v-model="searchParams.name"
                  placeholder="请输入部门名称"
                  clearable
                  @keyup.enter="onSearch"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
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
      </div>

      <div class="dept-page__toolbar">
        <el-button
          v-hasPermi="[PERM.DEPARTMENT_CREATE]"
          type="primary"
          @click="handleAdd"
        >
          新增部门
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="list"
        style="width: 100%"
        row-key="departmentId"
        :tree-props="{ children: 'children' }"
        default-expand-all
        border
      >
        <el-table-column label="部门名称" prop="name" min-width="200" />
        <el-table-column label="排序" prop="sort" width="100" />
        <el-table-column label="负责人" prop="manager" min-width="120" />
        <el-table-column label="状态" prop="status" width="100">
          <template #default="{ row }">
            <StatusTag :value="row.status" :options="dict.common_status" />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createdAt" min-width="160">
          <template #default="{ row }">
            <DateTimeFormat :value="row.createdAt" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-space :size="0">
              <el-button
                v-hasPermi="[PERM.DEPARTMENT_UPDATE]"
                type="primary"
                link
                size="small"
                @click="handleEdit(row as API.DepartmentResponseDto)"
              >
                <template #icon><Icon name="ElEdit" /></template>
                修改
              </el-button>
              <el-button
                v-hasPermi="[PERM.DEPARTMENT_DELETE]"
                type="danger"
                link
                size="small"
                @click="handleDelete(row as API.DepartmentResponseDto)"
              >
                <template #icon><Icon name="ElDelete" /></template>
                删除
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 部门新增修改弹窗 -->
    <DepartmentForm ref="deptFormRef" :dict="dict" :on-ok="handleFormOk" />
  </PageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { queryDepartmentTree, deleteDepartment } from '@/api/department'
import { useDict } from '@/composables/useDict'
import { useSearchForm } from '@/composables/useSearchForm'
import { PERM } from '@/constants/permission'
import { logger } from '@/utils'
import DepartmentForm from './DepartmentForm.vue'

const dict = useDict(['common_status'])

// ─── 部门树 ───────────────────────────────────────────────
const loading = ref(false)
const list = ref<API.DepartmentResponseDto[]>([])

const fetchTree = async (params?: Record<string, any>) => {
  loading.value = true
  try {
    const res = await queryDepartmentTree(params)
    list.value = (res?.data as any) ?? []
  } catch (error) {
    logger.error(error)
    list.value = []
  } finally {
    loading.value = false
  }
}

// ─── 搜索表单 ─────────────────────────────────────────────
const { searchExpanded, searchParams, dateRange, onSearch, onReset } =
  useSearchForm(
    {
      name: undefined as string | undefined,
      status: undefined as string | undefined,
    },
    (params) => fetchTree(params),
    () => fetchTree({}),
  )

onMounted(() => fetchTree())

// ─── 增删改 ───────────────────────────────────────────────
const deptFormRef = ref<InstanceType<typeof DepartmentForm>>()

const handleAdd = () => deptFormRef.value?.show('添加部门')
const handleEdit = (row: API.DepartmentResponseDto) =>
  deptFormRef.value?.show('修改部门', row.departmentId)
const handleFormOk = () => fetchTree()

const handleDelete = (row: API.DepartmentResponseDto) => {
  ElMessageBox.confirm(`是否确认删除部门“${row.name}”？`, '系统提示', {
    type: 'warning',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
  })
    .then(async () => {
      await deleteDepartment(row.departmentId)
      ElMessage.success('删除成功')
      fetchTree()
    })
    .catch(() => {})
}
</script>

<style lang="scss" scoped>
.dept-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;

  &__search {
    flex-shrink: 0;

    :deep(.el-row) {
      row-gap: 16px;
    }

    :deep(.el-form-item) {
      margin-bottom: 0;
    }
  }

  &__toolbar {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
    margin-top: 16px;
    margin-bottom: 12px;
  }
}
</style>
