<template>
  <div v-if="loading" class="activity-loading">
    <Icon name="ElLoading" class-name="is-loading" :size="24" />
  </div>

  <div v-else-if="!logs || logs.length === 0" class="activity-empty">
    暂无操作记录
  </div>

  <div v-else class="activity-timeline">
    <el-timeline>
      <el-timeline-item
        v-for="log in logs"
        :key="`${log.time}-${log.user}-${log.action}`"
        :color="getTimelineDotColor(log.status)"
      >
        <div class="activity-item">
          <div class="activity-item__left">
            <span class="activity-item__icon">
              <Icon :name="getActionIcon(log.action)" :size="16" />
            </span>
            <div class="activity-item__info">
              <div class="activity-item__title">
                <span class="activity-item__user">{{ log.user }}</span>
                <span class="activity-item__action">{{ log.action }}</span>
              </div>
              <div class="activity-item__time">{{ log.time }}</div>
            </div>
          </div>
          <div class="activity-item__right">
            <span class="activity-item__ip">{{ log.ip }}</span>
            <el-tag
              :type="log.status === '成功' ? 'success' : 'danger'"
              :effect="'light'"
              round
            >
              <Icon
                :name="
                  log.status === '成功'
                    ? 'CheckCircleOutlined'
                    : 'CloseCircleOutlined'
                "
                :size="12"
                :style="{ marginRight: '4px' }"
              />
              {{ log.status }}
            </el-tag>
          </div>
        </div>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script setup lang="ts">
import type { ActivityLog } from '../composables/useDashboard'

interface Props {
  logs: ActivityLog[]
  loading?: boolean
}

defineProps<Props>()

function getActionIcon(action: string) {
  if (action.includes('删除')) return 'DeleteOutlined'
  if (
    action.includes('修改') ||
    action.includes('编辑') ||
    action.includes('更新')
  )
    return 'EditOutlined'
  if (action.includes('登录')) return 'LoginOutlined'
  if (action.includes('权限')) return 'SafetyCertificateOutlined'
  if (
    action.includes('新增') ||
    action.includes('创建') ||
    action.includes('注册')
  )
    return 'UserAddOutlined'
  return 'EditOutlined'
}

function getTimelineDotColor(status: string): string {
  return status === '成功'
    ? 'var(--gvray-color-success)'
    : 'var(--gvray-color-error)'
}
</script>

<style lang="scss" scoped>
.activity-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.activity-empty {
  text-align: center;
  padding: 40px 0;
  color: var(--gvray-color-text-placeholder);
}

.activity-timeline {
  padding: 8px 0;
}

.activity-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--gvray-color-bg-elevated);
  transition: background 0.2s;

  &:hover {
    background: var(--gvray-color-primary-1);
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__icon {
    font-size: 16px;
    display: inline-flex;
    align-items: center;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__title {
    font-size: 13px;
    font-weight: 600;
    color: var(--gvray-color-text);
  }

  &__user {
    font-weight: 600;
  }

  &__action {
    font-weight: 400;
    color: var(--gvray-color-text-secondary);
  }

  &__time {
    font-size: 12px;
    color: var(--gvray-color-text-secondary);
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__ip {
    font-family: 'SF Mono', 'Menlo', monospace;
    font-size: 12px;
    color: var(--gvray-color-text-secondary);
  }
}
</style>
