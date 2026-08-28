<template>
  <PageContainer>
    <div class="dict-items-header">
      <el-button text class="dict-items-back" @click="handleBack">
        <template #icon><Icon name="ElArrowLeft" /></template>
        返回
      </el-button>
      <div class="dict-items-title">
        {{ typeDetail?.name || '字典项管理' }}
      </div>
      <span class="dict-items-desc">
        编码：{{ typeDetail?.code || '-' }} · 描述：{{
          typeDetail?.description || '暂无描述'
        }}
      </span>
    </div>

    <el-card>
      <TablePro
        v-if="typeDetail?.code"
        v-model:page="page"
        v-model:page-size="pageSize"
        :total="total"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      >
        <template #search>
          <el-form
            :model="searchParams"
            class="dict-items-page__search-form"
            @submit.prevent="onSearch"
          >
            <el-row :gutter="24">
              <el-col :span="8">
                <el-form-item label="字典标签" prop="label">
                  <el-input
                    v-model="searchParams.label"
                    placeholder="请输入字典标签"
                    clearable
                    @keyup.enter="onSearch"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="字典值" prop="value">
                  <el-input
                    v-model="searchParams.value"
                    placeholder="请输入字典值"
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
            新增字典项
          </el-button>
        </template>

        <el-table
          v-loading="loading"
          :data="list"
          style="width: 100%"
          row-key="itemId"
        >
          <el-table-column label="字典项ID" prop="itemId" width="140">
            <template #default="{ row }">
              <CopyId :id="row.itemId" />
            </template>
          </el-table-column>
          <el-table-column label="字典标签" prop="label" min-width="140" />
          <el-table-column label="字典值" prop="value" width="120">
            <template #default="{ row }">
              <el-tag type="primary">{{ row.value }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="排序" prop="sort" width="80">
            <template #default="{ row }">
              <el-tag>{{ row.sort }}</el-tag>
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
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-space :size="0">
                <el-button
                  v-hasPermi="[PERM.DICTIONARY_UPDATE]"
                  type="primary"
                  link
                  size="small"
                  @click="handleEdit(row as API.DictionaryItemResponseDto)"
                >
                  <template #icon><Icon name="ElEdit" /></template>
                  编辑
                </el-button>
                <el-button
                  v-hasPermi="[PERM.DICTIONARY_DELETE]"
                  type="danger"
                  link
                  size="small"
                  @click="handleDelete(row as API.DictionaryItemResponseDto)"
                >
                  <template #icon><Icon name="ElDelete" /></template>
                  删除
                </el-button>
              </el-space>
            </template>
          </el-table-column>
        </el-table>
      </TablePro>

      <div v-else-if="!loading" class="dict-items-empty">请提供字典类型ID</div>
    </el-card>

    <DictionaryItemForm
      ref="itemFormRef"
      :type-code="typeDetail?.code"
      :dict="dict"
      :on-ok="handleFormOk"
    />
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  queryDictionaryItemList,
  getDictionaryTypeById,
  deleteDictionaryItem,
} from '@/api/dictionary'
import { useDict } from '@/composables/useDict'
import { useTablePage } from '@/composables/useTablePage'
import { useSearchForm } from '@/composables/useSearchForm'
import { PERM } from '@/constants/permission'
import { logger } from '@/utils'
import DictionaryItemForm from './DictionaryItemForm.vue'

const route = useRoute()
const router = useRouter()
const dict = useDict(['common_status'])

const typeId = route.params.typeId as string
const typeDetail = ref<API.DictionaryTypeResponseDto>()

const {
  loading,
  list,
  total,
  page,
  pageSize,
  fetchList,
  reload,
  handleSearch,
  handleReset,
  handlePageChange,
  handleSizeChange,
} = useTablePage<API.DictionaryItemResponseDto>(
  (params) =>
    queryDictionaryItemList({
      ...params,
      typeCode: typeDetail.value?.code,
    }),
  { immediate: false },
)

const { searchExpanded, searchParams, onSearch, onReset } = useSearchForm(
  {
    label: undefined as string | undefined,
    value: undefined as string | undefined,
    status: undefined as string | undefined,
  },
  handleSearch,
  handleReset,
)

onMounted(async () => {
  if (!typeId) return
  try {
    const { data } = await getDictionaryTypeById(typeId)
    typeDetail.value = data
    fetchList()
  } catch (error) {
    logger.error(error)
  }
})

const itemFormRef = ref<InstanceType<typeof DictionaryItemForm>>()

const handleAdd = () => itemFormRef.value?.show('添加字典项')
const handleEdit = (row: API.DictionaryItemResponseDto) =>
  itemFormRef.value?.show('修改字典项', row.itemId)
const handleFormOk = () => reload()

const handleBack = () => router.back()

const handleDelete = (row: API.DictionaryItemResponseDto) => {
  ElMessageBox.confirm(`是否确认删除字典项“${row.label}”？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
  })
    .then(async () => {
      await deleteDictionaryItem(row.itemId)
      ElMessage.success('删除成功')
      reload()
    })
    .catch(() => {})
}
</script>

<style scoped>
.dict-items-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.dict-items-back {
  flex-shrink: 0;
}
.dict-items-title {
  font-size: 16px;
  font-weight: 600;
}
.dict-items-desc {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
.dict-items-empty {
  text-align: center;
  color: var(--el-text-color-placeholder);
  padding: 40px 0;
}
</style>
