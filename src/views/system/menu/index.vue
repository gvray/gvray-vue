<template>
  <PageContainer>
    <div class="menu-page">
      <div class="menu-page__search">
        <el-form
          :model="searchParams"
          class="menu-page__search-form"
          @submit.prevent="onSearch"
        >
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="菜单名称" prop="name">
                <el-input
                  v-model="searchParams.name"
                  placeholder="请输入菜单名称"
                  clearable
                  @keyup.enter="onSearch"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="路径" prop="path">
                <el-input
                  v-model="searchParams.path"
                  placeholder="请输入路径"
                  clearable
                  @keyup.enter="onSearch"
                />
              </el-form-item>
            </el-col>
            <el-col v-show="searchExpanded" :span="8">
              <el-form-item label="类型" prop="type">
                <el-select
                  v-model="searchParams.type"
                  placeholder="请选择类型"
                  clearable
                  style="width: 100%"
                >
                  <el-option label="目录" value="CATALOG" />
                  <el-option label="菜单" value="MENU" />
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

      <div class="menu-page__toolbar">
        <el-button
          v-hasPermi="[PERM.MENU_CREATE]"
          type="primary"
          @click="handleAdd"
        >
          <template #icon><Icon name="ElPlus" /></template>
          新增菜单
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="list"
        row-key="menuId"
        :tree-props="{ children: 'children' }"
        default-expand-all
        border
        style="width: 100%"
      >
        <el-table-column label="菜单名称" prop="name" min-width="180" fixed />
        <el-table-column label="图标" prop="icon" width="70" align="center">
          <template #default="{ row }">
            <Icon v-if="row.icon" :name="toIconKey(row.icon)" :size="16" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" prop="type" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === 'CATALOG' ? 'primary' : 'success'">
              {{ row.type === 'CATALOG' ? '目录' : '菜单' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="路径" prop="path" min-width="160">
          <template #default="{ row }">
            {{ row.path || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status" width="90" align="center">
          <template #default="{ row }">
            <StatusTag :value="row.status" :options="dict.common_status" />
          </template>
        </el-table-column>
        <el-table-column
          label="是否隐藏"
          prop="hidden"
          width="90"
          align="center"
        >
          <template #default="{ row }">
            <el-tag :type="row.hidden ? 'info' : 'success'">
              {{ row.hidden ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createdAt" min-width="160">
          <template #default="{ row }">
            <DateTimeFormat :value="row.createdAt" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-space :size="0">
              <el-button
                v-hasPermi="[PERM.MENU_UPDATE]"
                type="primary"
                link
                size="small"
                @click="handleEdit(row as API.MenuTreeNodeDto)"
              >
                <template #icon><Icon name="ElEdit" /></template>
                修改
              </el-button>
              <el-button
                v-hasPermi="[PERM.MENU_DELETE]"
                type="danger"
                link
                size="small"
                @click="handleDelete(row as API.MenuTreeNodeDto)"
              >
                <template #icon><Icon name="ElDelete" /></template>
                删除
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <MenuForm ref="menuFormRef" :dict="dict" :on-ok="handleFormOk" />
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { queryMenuTree, deleteMenu } from '@/api/menu'
import { useDict } from '@/composables/useDict'
import { useSearchForm } from '@/composables/useSearchForm'
import { PERM } from '@/constants/permission'
import { logger } from '@/utils'
import type { IconKey } from '@/components/Icon/map'
import MenuForm from './MenuForm.vue'

const dict = useDict(['common_status'])

const toIconKey = (name: string): IconKey => name as IconKey

const loading = ref(false)
const list = ref<API.MenuTreeNodeDto[]>([])

const fetchList = async (params?: API.MenuGetTreeParams) => {
  loading.value = true
  try {
    const { data } = await queryMenuTree(params)
    list.value = data ?? []
  } catch (error) {
    logger.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = (params: Record<string, any>) =>
  fetchList(params as API.MenuGetTreeParams)
const handleReset = () => fetchList()

const { searchExpanded, searchParams, dateRange, onSearch, onReset } =
  useSearchForm(
    {
      name: undefined as string | undefined,
      path: undefined as string | undefined,
      type: undefined as string | undefined,
      status: undefined as string | undefined,
    },
    handleSearch,
    handleReset,
  )

const menuFormRef = ref<InstanceType<typeof MenuForm>>()
const handleAdd = () => menuFormRef.value?.show('添加菜单')
const handleEdit = (row: API.MenuTreeNodeDto) =>
  menuFormRef.value?.show('修改菜单', row.menuId)
const handleFormOk = () => fetchList()

const handleDelete = (row: API.MenuTreeNodeDto) => {
  ElMessageBox.confirm(`是否确认删除菜单"${row.name}"？`, '系统提示', {
    type: 'warning',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
  })
    .then(async () => {
      await deleteMenu(row.menuId)
      ElMessage.success('删除成功')
      fetchList()
    })
    .catch(() => {})
}

onMounted(() => fetchList())
</script>

<style lang="scss" scoped>
.menu-page {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__search {
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
  }
}
</style>
