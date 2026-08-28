<template>
  <PageContainer>
    <div class="permission-page">
      <div class="permission-page__toolbar">
        <el-button
          v-hasPermi="[PERM.PERMISSION_SCAN]"
          type="primary"
          :loading="scanning"
          @click="handleSync"
        >
          <template #icon><Icon name="ElRefresh" /></template>
          {{ t('permission.action.scan') }}
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="treeData"
        row-key="permissionId"
        :tree-props="{ children: 'children' }"
        default-expand-all
        border
        style="width: 100%"
      >
        <el-table-column
          :label="t('permission.column.name')"
          prop="name"
          min-width="240"
          fixed
        >
          <template #default="{ row }">
            <span
              v-if="row.isVirtual && row.nodeType === 'DOMAIN'"
              class="permission-page__name--domain"
            >
              {{ getLabel(row.intlId, row.name) }}
            </span>
            <span
              v-else-if="row.isVirtual && row.nodeType === 'RESOURCE'"
              class="permission-page__name--resource"
            >
              {{ getLabel(row.intlId, row.name) }}
            </span>
            <el-tooltip v-else :content="row.name" placement="top">
              <span>{{ row.name }}</span>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column
          :label="t('permission.column.code')"
          prop="code"
          width="220"
        >
          <template #default="{ row }">
            <span v-if="row.isVirtual">-</span>
            <el-text v-else>{{ row.code }}</el-text>
          </template>
        </el-table-column>

        <el-table-column
          :label="t('permission.column.description')"
          prop="description"
          min-width="200"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <el-text v-if="row.isVirtual" type="info" size="small">
              {{
                row.nodeType === 'DOMAIN'
                  ? t('permission.desc.domain')
                  : t('permission.desc.resource')
              }}
            </el-text>
            <span v-else-if="!row.description">-</span>
            <span v-else>{{ row.description }}</span>
          </template>
        </el-table-column>

        <el-table-column
          :label="t('permission.column.origin')"
          prop="origin"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag v-if="row.isVirtual" type="info" size="small">
              {{ t('permission.tag.group') }}
            </el-tag>
            <el-tag
              v-else
              :type="row.origin === 'SYSTEM' ? 'primary' : 'success'"
              size="small"
            >
              {{
                row.origin === 'SYSTEM'
                  ? t('permission.origin.system')
                  : t('permission.origin.user')
              }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          :label="t('permission.column.updatedAt')"
          prop="updatedAt"
          width="180"
        >
          <template #default="{ row }">
            <DateTimeFormat
              v-if="!row.isVirtual && row.updatedAt"
              :value="row.updatedAt"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column
          :label="t('permission.column.action')"
          width="100"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              v-if="!row.isVirtual"
              v-hasPermi="[PERM.PERMISSION_UPDATE]"
              type="primary"
              link
              size="small"
              @click="handleEdit(row as PermissionTreeNode)"
            >
              <template #icon><Icon name="ElEdit" /></template>
              {{ t('permission.action.edit') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <UpdateForm ref="updateFormRef" :on-ok="handleFormOk" />
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { queryPermissionFlat, scanPermissions } from '@/api/permission'
import { PERM } from '@/constants/permission'
import { logger } from '@/utils'
import UpdateForm from './components/UpdateForm.vue'

type VirtualNodeType = 'DOMAIN' | 'RESOURCE' | 'ACTION'

interface PermissionTreeNode extends API.PermissionResponseDto {
  nodeType: VirtualNodeType
  isVirtual: boolean
  children?: PermissionTreeNode[]
  intlId?: string
}

const { t } = useI18n()

const loading = ref(false)
const scanning = ref(false)
const treeData = ref<PermissionTreeNode[]>([])
const updateFormRef = ref<InstanceType<typeof UpdateForm>>()

const getLabel = (id?: string, fallback?: string) => {
  if (!id) return fallback || ''
  const msg = t(id)
  return msg === id ? fallback || id : msg
}

/** 扁平权限按 code（domain:resource:action）组装为树，domain/resource 为虚拟分组节点 */
const buildPermissionTree = (
  list: API.PermissionResponseDto[],
): PermissionTreeNode[] => {
  const domainMap = new Map<string, PermissionTreeNode>()

  for (const item of list) {
    const parts = item.code?.split(':') || []
    if (parts.length < 2) continue

    const [domain, resource] = parts
    const resourceKey = `${domain}:${resource}`

    if (!domainMap.has(domain)) {
      domainMap.set(domain, {
        permissionId: `_domain_${domain}`,
        id: 0,
        name: domain,
        intlId: `permission.domain.${domain}`,
        code: domain,
        httpMethod: '',
        origin: 'SYSTEM',
        mutable: false,
        createdAt: '',
        updatedAt: '',
        nodeType: 'DOMAIN',
        isVirtual: true,
        children: [] as PermissionTreeNode[],
      })
    }
    const domainNode = domainMap.get(domain)!

    let resourceNode = domainNode.children!.find(
      (c) => c.permissionId === `_resource_${resourceKey}`,
    )
    if (!resourceNode) {
      resourceNode = {
        permissionId: `_resource_${resourceKey}`,
        id: 0,
        name: resourceKey,
        intlId: `permission.resource.${resourceKey}`,
        code: resourceKey,
        httpMethod: '',
        origin: 'SYSTEM',
        mutable: false,
        createdAt: '',
        updatedAt: '',
        nodeType: 'RESOURCE',
        isVirtual: true,
        children: [] as PermissionTreeNode[],
      }
      domainNode.children!.push(resourceNode)
    }

    const action = parts.slice(2).join(':')
    resourceNode.children!.push({
      ...item,
      intlId: `permission.action.${action}`,
      nodeType: 'ACTION',
      isVirtual: false,
    })
  }

  return Array.from(domainMap.values())
}

const fetchList = async () => {
  loading.value = true
  try {
    const { data } = await queryPermissionFlat()
    treeData.value = data ? buildPermissionTree(data) : []
  } catch (error) {
    logger.error(error)
  } finally {
    loading.value = false
  }
}

const handleSync = async () => {
  scanning.value = true
  try {
    await scanPermissions()
    ElMessage.success(t('permission.message.scanSuccess'))
    await fetchList()
  } catch (error) {
    logger.error(error)
  } finally {
    scanning.value = false
  }
}

const handleEdit = (row: PermissionTreeNode) => {
  if (row.isVirtual) return
  updateFormRef.value?.show(t('permission.action.edit'), row)
}

const handleFormOk = () => {
  fetchList()
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
.permission-page {
  &__toolbar {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  &__name--domain {
    font-weight: 600;
    color: var(--gvray-color-text-heading, var(--el-text-color-primary));
  }

  &__name--resource {
    font-weight: 500;
    color: var(--gvray-color-text-secondary, var(--el-text-color-secondary));
  }
}
</style>
