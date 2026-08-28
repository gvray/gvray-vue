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
          class="dictionary-page__search-form"
          @submit.prevent="onSearch"
        >
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="字典名称" prop="name">
                <el-input
                  v-model="searchParams.name"
                  placeholder="请输入字典名称"
                  clearable
                  @keyup.enter="onSearch"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="字典编码" prop="code">
                <el-input
                  v-model="searchParams.code"
                  placeholder="请输入字典编码"
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
          v-hasPermi="[PERM.DICTIONARY_CREATE]"
          type="primary"
          @click="handleAdd"
        >
          新增字典类型
        </el-button>
      </template>

      <el-table
        v-loading="loading"
        :data="list"
        style="width: 100%"
        row-key="typeId"
      >
        <el-table-column label="字典编号" prop="typeId" width="120">
          <template #default="{ row }">
            <CopyId :id="row.typeId" />
          </template>
        </el-table-column>
        <el-table-column label="字典名称" prop="name" min-width="200">
          <template #default="{ row }">
            <el-tooltip
              :content="row.description"
              :disabled="!row.description"
              placement="top"
            >
              <span class="dict-name">{{ row.name }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="字典编码" prop="code" width="160">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.code }}</el-tag>
          </template>
        </el-table-column>
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
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-space :size="0">
              <el-button
                v-hasPermi="[PERM.DICTIONARY_UPDATE]"
                type="primary"
                link
                size="small"
                @click="handleEdit(row as API.DictionaryTypeResponseDto)"
              >
                <template #icon><Icon name="ElEdit" /></template>
                编辑
              </el-button>
              <el-button
                v-hasPermi="[PERM.DICTIONARY_UPDATE]"
                type="primary"
                link
                size="small"
                @click="handleManageItems(row as API.DictionaryTypeResponseDto)"
              >
                <template #icon><Icon name="ElSetting" /></template>
                字典项
              </el-button>
              <el-button
                v-hasPermi="[PERM.DICTIONARY_DELETE]"
                type="danger"
                link
                size="small"
                @click="handleDelete(row as API.DictionaryTypeResponseDto)"
              >
                <template #icon><Icon name="ElDelete" /></template>
                删除
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </TablePro>

    <DictionaryForm
      ref="dictionaryFormRef"
      :dict="dict"
      :on-ok="handleFormOk"
    />
  </PageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { queryDictionaryTypeList, deleteDictionaryType } from '@/api/dictionary'
import { useDict } from '@/composables/useDict'
import { useTablePage } from '@/composables/useTablePage'
import { useSearchForm } from '@/composables/useSearchForm'
import { PERM } from '@/constants/permission'
import DictionaryForm from './DictionaryForm.vue'

const router = useRouter()
const dict = useDict(['common_status'])

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
} = useTablePage<API.DictionaryTypeResponseDto>(queryDictionaryTypeList)

const { searchExpanded, searchParams, dateRange, onSearch, onReset } =
  useSearchForm(
    {
      name: undefined as string | undefined,
      code: undefined as string | undefined,
      status: undefined as string | undefined,
    },
    handleSearch,
    handleReset,
  )

const dictionaryFormRef = ref<InstanceType<typeof DictionaryForm>>()

const handleAdd = () => dictionaryFormRef.value?.show('添加字典类型')
const handleEdit = (row: API.DictionaryTypeResponseDto) =>
  dictionaryFormRef.value?.show('修改字典类型', row.typeId)
const handleFormOk = () => reload()

const handleManageItems = (row: API.DictionaryTypeResponseDto) => {
  router.push(`/system/dictionary/items/${row.typeId}`)
}

const handleDelete = (row: API.DictionaryTypeResponseDto) => {
  ElMessageBox.confirm(
    `删除后将无法恢复，且会同时删除该类型下的所有字典项。是否确认删除字典类型“${row.name}”？`,
    '删除确认',
    {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
    },
  )
    .then(async () => {
      await deleteDictionaryType(row.typeId)
      ElMessage.success('删除成功')
      reload()
    })
    .catch(() => {})
}
</script>

<style scoped>
.dict-name {
  font-weight: 500;
}
</style>
