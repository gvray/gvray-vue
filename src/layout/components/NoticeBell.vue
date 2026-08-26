<template>
  <el-dropdown
    v-if="settingStore.enableNotification"
    ref="dropdownRef"
    placement="bottom-end"
    trigger="click"
    :show-arrow="false"
    :hide-on-click="false"
    :popper-style="{ width: '400px' }"
    @visible-change="handleVisibleChange"
  >
    <div class="navbar-action-item notice-bell">
      <el-badge
        :value="unreadCount"
        :max="99"
        :hidden="unreadCount === 0"
        :offset="[2, 0]"
      >
        <Icon name="gvray-notification" :size="18" />
      </el-badge>
    </div>

    <template #dropdown>
      <div class="notice-panel">
        <div class="notice-panel__header">
          <span class="notice-panel__title">通知公告</span>
          <div class="notice-panel__actions">
            <el-button
              v-if="unreadCount > 0"
              type="primary"
              link
              size="small"
              :icon="Check"
              @click="handleMarkAllRead"
            >
              全部已读
            </el-button>
            <el-button type="primary" link size="small" @click="handleGoManage">
              管理
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>

        <el-tabs v-model="activeTab" class="notice-panel__tabs">
          <el-tab-pane :label="`未读 (${unreadList.length})`" name="unread">
            <div class="notice-list">
              <template v-if="unreadList.length > 0">
                <div
                  v-for="item in unreadList"
                  :key="item.noticeId"
                  class="notice-item notice-item--unread"
                  @click="handleOpenDetail(item)"
                >
                  <div class="notice-item__row">
                    <span class="notice-item__title">{{ item.title }}</span>
                    <el-tag
                      v-if="typeTag(item.type)"
                      :type="typeTag(item.type)?.type"
                      size="small"
                    >
                      {{ typeTag(item.type)?.label }}
                    </el-tag>
                  </div>
                  <div class="notice-item__content">{{ item.content }}</div>
                  <div class="notice-item__meta">
                    <span
                      ><el-icon><Clock /></el-icon
                      >{{ formatTime(item.createdAt) }}</span
                    >
                    <el-button
                      type="primary"
                      link
                      size="small"
                      @click.stop="handleMarkRead(item.noticeId)"
                    >
                      标记已读
                    </el-button>
                  </div>
                </div>
              </template>
              <el-empty v-else description="暂无未读通知" :image-size="60" />
            </div>
          </el-tab-pane>
          <el-tab-pane label="全部" name="all">
            <div class="notice-list">
              <template v-if="noticeList.length > 0">
                <div
                  v-for="item in noticeList"
                  :key="item.noticeId"
                  class="notice-item"
                  :class="{ 'notice-item--unread': !item.isRead }"
                  @click="handleOpenDetail(item)"
                >
                  <div class="notice-item__row">
                    <span class="notice-item__title">{{ item.title }}</span>
                    <el-tag
                      v-if="typeTag(item.type)"
                      :type="typeTag(item.type)?.type"
                      size="small"
                    >
                      {{ typeTag(item.type)?.label }}
                    </el-tag>
                  </div>
                  <div class="notice-item__content">{{ item.content }}</div>
                  <div class="notice-item__meta">
                    <span
                      ><el-icon><Clock /></el-icon
                      >{{ formatTime(item.createdAt) }}</span
                    >
                  </div>
                </div>
              </template>
              <el-empty v-else description="暂无通知公告" :image-size="60" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </template>
  </el-dropdown>

  <el-dialog v-model="detailVisible" title="通知详情" width="520">
    <div v-if="detailNotice" class="notice-detail">
      <div class="notice-detail__header">
        <h3>{{ detailNotice.title }}</h3>
        <el-tag
          v-if="typeTag(detailNotice.type)"
          :type="typeTag(detailNotice.type)?.type"
          size="small"
        >
          {{ typeTag(detailNotice.type)?.label }}
        </el-tag>
      </div>
      <div class="notice-detail__meta">
        <span
          ><el-icon><Clock /></el-icon
          >{{ formatFullTime(detailNotice.createdAt) }}</span
        >
        <el-tag
          :type="detailNotice.status === 'enabled' ? 'success' : 'info'"
          size="small"
        >
          {{ detailNotice.status === 'enabled' ? '启用' : '禁用' }}
        </el-tag>
      </div>
      <div class="notice-detail__content">{{ detailNotice.content }}</div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Check, ArrowRight, Clock } from '@element-plus/icons-vue'
import {
  queryNoticeList,
  getUnreadNoticeCount,
  markNoticeRead,
  markAllNoticesRead,
} from '@/api/notice'
import Icon from '@/components/Icon/index.vue'
import { useSettingStore } from '@/stores/setting'

const settingStore = useSettingStore()

interface NoticeResponseDto {
  noticeId: string
  title: string
  content: string
  type: string
  status: string
  isRead: boolean
  createdAt: string
}

const TYPE_TAG: Record<string, { label: string; type: 'primary' | 'danger' }> =
  {
    notice: { label: '通知', type: 'primary' },
    announcement: { label: '通告', type: 'danger' },
  }

const router = useRouter()
const dropdownRef = ref<any>(null)

const unreadCount = ref(0)
const noticeList = ref<NoticeResponseDto[]>([])
const loading = ref(false)
const activeTab = ref('unread')
const detailVisible = ref(false)
const detailNotice = ref<NoticeResponseDto | null>(null)

const unreadList = computed(() => noticeList.value.filter((n) => !n.isRead))

const typeTag = (type: string) => TYPE_TAG[type]

const fetchUnreadCount = async (): Promise<boolean> => {
  try {
    const res = await getUnreadNoticeCount()
    unreadCount.value = res.data.count
    return true
  } catch {
    return false
  }
}

const fetchNotices = async () => {
  loading.value = true
  try {
    const res = await queryNoticeList({
      page: 1,
      pageSize: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
    noticeList.value = res.data?.items || []
  } catch {
    noticeList.value = []
  } finally {
    loading.value = false
  }
}

const handleOpen = () => {
  fetchNotices()
  fetchUnreadCount()
}

const handleVisibleChange = (visible: boolean) => {
  if (visible) {
    handleOpen()
  }
}

const handleMarkRead = async (noticeId: string) => {
  try {
    await markNoticeRead(noticeId)
    const item = noticeList.value.find((n) => n.noticeId === noticeId)
    if (item) {
      item.isRead = true
    }
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  } catch {
    // silent
  }
}

const handleMarkAllRead = async () => {
  try {
    await markAllNoticesRead()
    noticeList.value.forEach((n) => (n.isRead = true))
    unreadCount.value = 0
    ElMessage.success('全部标记为已读')
  } catch {
    // silent
  }
}

const handleGoManage = () => {
  dropdownRef.value?.handleClose?.()
  router.push('/system/notice')
}

const handleOpenDetail = (notice: NoticeResponseDto) => {
  if (!notice.isRead) {
    handleMarkRead(notice.noticeId)
  }
  detailNotice.value = notice
  detailVisible.value = true
}

const formatTime = (time: string) => {
  try {
    const d = new Date(time)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes} 分钟前`
    if (hours < 24) return `${hours} 小时前`
    if (days < 7) return `${days} 天前`
    return d.toLocaleDateString()
  } catch {
    return time
  }
}

const formatFullTime = (time: string) => {
  try {
    return new Date(time).toLocaleString()
  } catch {
    return time
  }
}

const POLLING_INTERVAL = 60_000
let pollingTimer: ReturnType<typeof setTimeout> | null = null

const runPolling = async () => {
  const success = await fetchUnreadCount()
  if (success !== false) {
    pollingTimer = setTimeout(runPolling, POLLING_INTERVAL)
  }
}

onMounted(() => {
  runPolling()
})

onUnmounted(() => {
  if (pollingTimer) clearTimeout(pollingTimer)
})
</script>

<style scoped lang="scss">
.notice-bell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}

.notice-panel {
  display: flex;
  flex-direction: column;
  padding: 12px;
}

.notice-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--gvray-color-border-split);
}

.notice-panel__title {
  font-weight: 600;
  font-size: 15px;
  color: var(--gvray-color-text);
}

.notice-panel__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.notice-list {
  max-height: 360px;
  padding: 8px 0;
  overflow-y: auto;
}

.notice-item {
  position: relative;
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--gvray-color-border-split);
  transition: background-color 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--gvray-color-fill-secondary);
  }

  &--unread {
    background-color: var(--gvray-color-fill);

    .notice-item__title {
      font-weight: 600;
    }

    &::before {
      content: '';
      position: absolute;
      left: 4px;
      top: 16px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--gvray-color-primary);
    }
  }
}

.notice-item__row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.notice-item__title {
  font-size: 14px;
  color: var(--gvray-color-text);
  line-height: 1.4;
  flex: 1;
  word-break: break-all;
}

.notice-item__content {
  margin-top: 4px;
  font-size: 12px;
  color: var(--gvray-color-text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}

.notice-item__meta {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--gvray-color-text-secondary);
}

.notice-detail {
  .notice-detail__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--gvray-color-text);
      line-height: 1.4;
      flex: 1;
      word-break: break-all;
    }
  }

  .notice-detail__meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    font-size: 13px;
    color: var(--gvray-color-text-secondary);
  }

  .notice-detail__content {
    font-size: 14px;
    line-height: 1.8;
    color: var(--gvray-color-text);
    white-space: pre-wrap;
    word-break: break-all;
    padding: 16px;
    background-color: var(--gvray-color-fill);
    border-radius: 8px;
    border: 1px solid var(--gvray-color-border-split);
  }
}
</style>
