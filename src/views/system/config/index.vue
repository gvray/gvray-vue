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
          class="config-page__search-form"
          @submit.prevent="onSearch"
        >
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="配置名称" prop="name">
                <el-input
                  v-model="searchParams.name"
                  placeholder="请输入配置名称"
                  clearable
                  @keyup.enter="onSearch"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="配置键" prop="key">
                <el-input
                  v-model="searchParams.key"
                  placeholder="请输入配置键"
                  clearable
                  @keyup.enter="onSearch"
                />
              </el-form-item>
            </el-col>
            <el-col v-show="searchExpanded" :span="8">
              <el-form-item label="分组" prop="group">
                <el-select
                  v-model="searchParams.group"
                  placeholder="请选择分组"
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in dict.config_group"
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
                    v-for="item in dict.common_status"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col v-show="searchExpanded" :span="8">
              <el-form-item label="前端公开" prop="isPublic">
                <el-select
                  v-model="searchParams.isPublic"
                  placeholder="请选择"
                  clearable
                  style="width: 100%"
                >
                  <el-option label="公开" value="true" />
                  <el-option label="私有" value="false" />
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
          v-hasPermi="[PERM.CONFIG_CREATE]"
          type="primary"
          @click="handleAdd"
        >
          新增配置
        </el-button>
      </template>

      <el-table
        v-loading="loading"
        :data="list"
        style="width: 100%"
        row-key="configId"
      >
        <el-table-column label="配置名称" prop="name" min-width="200">
          <template #default="{ row }">
            <el-tooltip
              :content="row.description"
              :disabled="!row.description"
              placement="top"
            >
              <span class="config-name">{{ row.name }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="配置键" prop="key" width="180">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.key }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="类型" prop="type" width="100">
          <template #default="{ row }">
            <el-tag>{{ dictLabel(dict.config_type, row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="分组" prop="group" width="120">
          <template #default="{ row }">
            <el-tag>{{ dictLabel(dict.config_group, row.group) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status" width="100">
          <template #default="{ row }">
            <StatusTag :value="row.status" :options="dict.common_status" />
          </template>
        </el-table-column>
        <el-table-column label="前端公开" prop="isPublic" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isPublic ? 'success' : 'info'">
              {{ row.isPublic ? '公开' : '私有' }}
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
                v-hasPermi="[PERM.CONFIG_VIEW]"
                type="primary"
                link
                size="small"
                @click="handleView(row as API.ConfigResponseDto)"
              >
                <template #icon><Icon name="ElView" /></template>
                查看
              </el-button>
              <el-button
                v-hasPermi="[PERM.CONFIG_UPDATE]"
                type="primary"
                link
                size="small"
                @click="handleEdit(row as API.ConfigResponseDto)"
              >
                <template #icon><Icon name="ElEdit" /></template>
                修改
              </el-button>
              <el-button
                v-hasPermi="[PERM.CONFIG_DELETE]"
                type="danger"
                link
                size="small"
                @click="handleDelete(row as API.ConfigResponseDto)"
              >
                <template #icon><Icon name="ElDelete" /></template>
                删除
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </TablePro>

    <ConfigForm ref="configFormRef" :dict="dict" :on-ok="handleFormOk" />
    <ConfigValueViewer
      v-if="currentConfig"
      v-model:visible="viewVisible"
      :config="currentConfig"
      :dict="dict"
    />
  </PageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { queryConfigList, getConfigById, deleteConfig } from '@/api/config'
import { useDict } from '@/composables/useDict'
import { useTablePage } from '@/composables/useTablePage'
import { useSearchForm } from '@/composables/useSearchForm'
import { PERM } from '@/constants/permission'
import { logger } from '@/utils'
import ConfigForm from './ConfigForm.vue'
import ConfigValueViewer from './components/ConfigValueViewer.vue'

const dict = useDict(['config_group', 'common_status', 'config_type'])

const dictLabel = (
  options: API.DictionaryItemResponseDto[] | undefined,
  value: string | number,
) =>
  options?.find((d) => String(d.value) === String(value))?.label ||
  String(value)

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
} = useTablePage<API.ConfigResponseDto>(queryConfigList)

const { searchExpanded, searchParams, dateRange, onSearch, onReset } =
  useSearchForm(
    {
      name: undefined as string | undefined,
      key: undefined as string | undefined,
      group: undefined as string | undefined,
      status: undefined as string | undefined,
      isPublic: undefined as string | undefined,
    },
    handleSearch,
    handleReset,
  )

const configFormRef = ref<InstanceType<typeof ConfigForm>>()
const viewVisible = ref(false)
const currentConfig = ref<API.ConfigResponseDto>()

const handleAdd = () => configFormRef.value?.show('添加配置')
const handleEdit = (row: API.ConfigResponseDto) =>
  configFormRef.value?.show('修改配置', row.configId)
const handleFormOk = () => reload()

const handleView = async (row: API.ConfigResponseDto) => {
  try {
    const { data } = await getConfigById(row.configId)
    currentConfig.value = data
    viewVisible.value = true
  } catch (error) {
    logger.error(error)
  }
}

const handleDelete = (row: API.ConfigResponseDto) => {
  ElMessageBox.confirm(`是否确认删除配置“${row.name}”？`, '系统提示', {
    type: 'warning',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
  })
    .then(async () => {
      await deleteConfig(row.configId)
      ElMessage.success('删除成功')
      reload()
    })
    .catch(() => {})
}
</script>

<style scoped>
.config-name {
  font-weight: 500;
}
</style>
