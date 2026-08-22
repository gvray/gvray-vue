<template>
  <div class="profile-tab-panel">
    <el-card class="module-card" size="small">
      <template #header>
        <div class="card-title">
          <icon name="HistoryOutlined" />
          <span>{{ t('profile.loginLog.title') }}</span>
        </div>
      </template>

      <div class="log-filters">
        <el-select
          v-model="statusFilter"
          clearable
          :placeholder="t('profile.loginLog.statusPlaceholder')"
          class="log-status-select"
          @change="handleStatusChange"
        >
          <el-option
            :label="t('profile.loginLog.statusSuccess')"
            value="success"
          />
          <el-option
            :label="t('profile.loginLog.statusFailure')"
            value="failure"
          />
        </el-select>

        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="log-range-picker"
        />

        <div class="log-actions">
          <el-button
            type="primary"
            :icon="Search"
            style="flex: 1"
            @click="handleSearch"
          >
            {{ t('profile.loginLog.search') }}
          </el-button>
          <el-button :icon="Refresh" style="flex: 1" @click="handleReset">
            {{ t('profile.loginLog.reset') }}
          </el-button>
        </div>
      </div>

      <el-table
        :data="data"
        row-key="id"
        :loading="loading"
        style="width: 100%"
      >
        <el-table-column
          prop="createdAt"
          :label="t('profile.loginLog.createdAt')"
          width="180"
        >
          <template #default="{ row }">
            {{ dayjs(row.createdAt).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
        </el-table-column>

        <el-table-column
          prop="ipAddress"
          :label="t('profile.loginLog.ipAddress')"
          width="140"
        />

        <el-table-column
          prop="location"
          :label="t('profile.loginLog.location')"
          width="120"
        >
          <template #default="{ row }">
            {{ row.location || '-' }}
          </template>
        </el-table-column>

        <el-table-column
          prop="device"
          :label="t('profile.loginLog.device')"
          width="120"
        >
          <template #default="{ row }">
            {{ row.device || '-' }}
          </template>
        </el-table-column>

        <el-table-column
          prop="browser"
          :label="t('profile.loginLog.browser')"
          width="120"
        >
          <template #default="{ row }">
            {{ row.browser || '-' }}
          </template>
        </el-table-column>

        <el-table-column
          prop="os"
          :label="t('profile.loginLog.os')"
          width="120"
        >
          <template #default="{ row }">
            {{ row.os || '-' }}
          </template>
        </el-table-column>

        <el-table-column
          prop="status"
          :label="t('profile.loginLog.status')"
          width="100"
        >
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{
                row.status === 1
                  ? t('profile.loginLog.success')
                  : t('profile.loginLog.failure')
              }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="failReason"
          :label="t('profile.loginLog.failReason')"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span v-if="row.failReason" class="table-danger-text">{{
              row.failReason
            }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="log-pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          :pager-count="5"
          @current-change="setPage"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import { Refresh, Search } from '@element-plus/icons-vue'
import Icon from '@/components/Icon/index.vue'
import { useProfileLoginLogModel } from '../composables/useProfile'

const { t } = useI18n()
const {
  data,
  loading,
  total,
  page,
  pageSize,
  statusFilter,
  dateRange,
  setPage,
  handleSearch,
  handleStatusChange,
  handleReset,
  handleSizeChange,
} = useProfileLoginLogModel()
</script>

<style scoped lang="scss">
.card-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.log-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.log-status-select,
.log-range-picker,
.log-actions {
  width: 100%;
}

.log-actions {
  display: flex;
  gap: 12px;
}

.log-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.table-danger-text {
  color: var(--gvray-color-error, #f5222d);
}
</style>
