<template>
  <div class="profile-tab-panel">
    <el-card class="module-card" size="small">
      <template #header>
        <div class="card-title">
          <icon name="ApiOutlined" />
          <span>{{ t('profile.permissions.title') }}</span>
        </div>
      </template>

      <template #extra>
        <el-input
          v-model="keyword"
          clearable
          :placeholder="t('profile.permissions.searchPlaceholder')"
          class="permission-filter"
        />
      </template>

      <div v-if="permData?.isSuperAdmin" class="super-admin-tip">
        <el-text type="info">{{
          t('profile.permissions.superAdminTip')
        }}</el-text>
      </div>

      <div v-loading="loading" class="tree-scroll">
        <el-tree
          v-if="tree.length > 0"
          :data="tree"
          node-key="permissionId"
          :props="{ label: 'name', children: 'children' }"
          :expanded-keys="expandedKeys"
          :default-expand-all="false"
          :highlight-current="false"
          @update:expanded-keys="setExpandedKeys"
        >
          <template #default="{ data }">
            <span class="permission-node-title">
              <el-tag
                v-if="data.nodeType === 'DOMAIN'"
                type="info"
                size="small"
                class="inline-tag"
              >
                {{ t('profile.permissions.domain') }}
              </el-tag>
              <el-tag
                v-else-if="data.nodeType === 'RESOURCE'"
                type="primary"
                size="small"
                class="inline-tag"
              >
                {{ t('profile.permissions.resource') }}
              </el-tag>
              <el-tag v-else type="success" size="small" class="inline-tag">
                {{ actionLabel(data.code) || t('profile.permissions.action') }}
              </el-tag>

              <span
                :class="[
                  'permission-name',
                  { 'permission-name--strong': data.nodeType === 'DOMAIN' },
                ]"
              >
                {{ data.name }}
              </span>

              <span
                v-if="data.code && data.nodeType !== 'DOMAIN'"
                class="permission-code"
              >
                {{ data.code }}
              </span>

              <el-tooltip
                v-if="
                  data.description &&
                  data.nodeType !== 'RESOURCE' &&
                  data.nodeType !== 'DOMAIN'
                "
                :content="String(data.description)"
                placement="top"
                :show-after="200"
              >
                <icon name="InfoCircleOutlined" class="permission-desc-icon" />
              </el-tooltip>
            </span>
          </template>
        </el-tree>

        <el-text v-else type="info">{{
          t('profile.permissions.empty')
        }}</el-text>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Icon from '@/components/Icon/index.vue'
import { useProfilePermissionsModel } from '../composables/useProfile'

const { t } = useI18n()
const { keyword, expandedKeys, setExpandedKeys, loading, permData, tree } =
  useProfilePermissionsModel()

const actionLabel = (code?: string) => {
  if (!code) return ''
  const parts = code.split(':')
  return parts.slice(2).join(':')
}
</script>

<style scoped lang="scss">
.card-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.permission-filter {
  min-width: 200px;
}

.super-admin-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.tree-scroll {
  min-width: 0;
  overflow-x: auto;
  padding: 2px 4px 4px;
}

.permission-node-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.inline-tag {
  margin: 0;
}

.permission-name {
  font-size: 13px;
}

.permission-name--strong {
  font-weight: 700;
}

.permission-code {
  font-size: 12px;
  color: var(--gvray-color-text-secondary, #595959);
}

.permission-desc-icon {
  color: var(--gvray-color-text-placeholder, #bfbfbf);
  font-size: 12px;
  cursor: help;

  &:hover {
    color: var(--gvray-color-primary, #1890ff);
  }
}

@media (max-width: 768px) {
  .permission-filter {
    width: 100%;
    min-width: 0;
  }

  .super-admin-tip {
    width: 100%;
  }
}
</style>
