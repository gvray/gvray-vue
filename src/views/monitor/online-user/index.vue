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
        <el-form :model="searchParams" @submit.prevent="onSearch">
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="登陆账号" prop="username">
                <el-input
                  v-model="searchParams.username"
                  placeholder="请输入登陆账号"
                  clearable
                  @keyup.enter="onSearch"
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
          v-hasPermi="[PERM.MONITOR_ONLINE_USER_KICK]"
          type="danger"
          :disabled="!selectedRows.length"
          @click="handleBatchKick"
        >
          <template #icon><Icon name="DeleteOutlined" /></template>
          批量强退
        </el-button>
      </template>

      <el-table
        v-loading="loading"
        :data="list"
        style="width: 100%"
        row-key="userId"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="48" />
        <el-table-column label="用户编号" prop="userId" width="120">
          <template #default="{ row }">
            <CopyId :id="row.userId" />
          </template>
        </el-table-column>
        <el-table-column label="登陆账号" prop="username" width="150" />
        <el-table-column label="用户昵称" prop="nickname" width="150" />
        <el-table-column label="最后活跃" prop="lastActiveAt" width="170">
          <template #default="{ row }">
            <DateTimeFormat :value="row.lastActiveAt" />
          </template>
        </el-table-column>
        <el-table-column
          label="会话数"
          prop="sessionCount"
          width="80"
          align="center"
        >
          <template #default="{ row }">
            <el-tag type="success" size="small">
              {{ row.sessionCount || 1 }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-space :size="0">
              <el-button
                v-hasPermi="[PERM.MONITOR_ONLINE_USER_VIEW]"
                type="primary"
                link
                size="small"
                @click="handleViewSessions(row as API.OnlineUserItemDto)"
              >
                <template #icon><Icon name="EyeOutlined" /></template>
                会话
              </el-button>
              <el-button
                v-hasPermi="[PERM.MONITOR_ONLINE_USER_KICK]"
                type="danger"
                link
                size="small"
                @click="handleKickUser(row as API.OnlineUserItemDto)"
              >
                <template #icon><Icon name="DeleteOutlined" /></template>
                强退
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </TablePro>

    <!-- ── 会话列表 Modal ── -->
    <el-dialog
      v-model="sessionModalVisible"
      :title="`${sessionUsername} 的会话列表`"
      width="900px"
      destroy-on-close
    >
      <el-table
        v-loading="sessionModalLoading"
        :data="sessionList"
        row-key="tokenHash"
        size="small"
        border
      >
        <el-table-column label="会话标识" prop="tokenHash" min-width="200">
          <template #default="{ row }">
            <el-tooltip :content="row.tokenHash" placement="top">
              <span class="online-user__token">{{ row.tokenHash }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="IP地址" prop="ipAddress" width="140" />
        <el-table-column label="登录地点" prop="location" width="120" />
        <el-table-column label="浏览器" prop="browser" width="120" />
        <el-table-column label="操作系统" prop="os" width="120" />
        <el-table-column label="设备" prop="device" width="120" />
        <el-table-column label="会话创建时间" prop="createdAt" width="170">
          <template #default="{ row }">
            <DateTimeFormat :value="row.createdAt" />
          </template>
        </el-table-column>
        <el-table-column label="最后活跃" prop="lastActiveAt" width="170">
          <template #default="{ row }">
            <DateTimeFormat :value="row.lastActiveAt" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              v-hasPermi="[PERM.MONITOR_ONLINE_USER_KICK]"
              type="danger"
              link
              size="small"
              @click="handleKickSession(row as API.SessionDetailDto)"
            >
              <template #icon><Icon name="DeleteOutlined" /></template>
              强退
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  queryOnlineUserList,
  queryUserSessions,
  kickUser,
  kickSession,
} from '@/api/onlineUser'
import { useTablePage } from '@/composables/useTablePage'
import { useSearchForm } from '@/composables/useSearchForm'
import { PERM } from '@/constants/permission'
import { logger } from '@/utils'

// ─── 列表 ───────────────────────────────────────────────
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
} = useTablePage<API.OnlineUserItemDto>((params) => {
  const { username, ...rest } = params
  return queryOnlineUserList({
    ...rest,
    ...(username ? { keyword: username } : {}),
  })
})

const { searchExpanded, searchParams, onSearch, onReset } = useSearchForm(
  { username: undefined as string | undefined },
  handleSearch,
  handleReset,
)

// ─── 选择 ───────────────────────────────────────────────
const selectedRows = ref<API.OnlineUserItemDto[]>([])
const handleSelectionChange = (rows: API.OnlineUserItemDto[]) => {
  selectedRows.value = rows
}

// ─── 会话 Modal ─────────────────────────────────────────
const sessionModalVisible = ref(false)
const sessionModalLoading = ref(false)
const sessionList = ref<API.SessionDetailDto[]>([])
const sessionUserId = ref('')
const sessionUsername = ref('')

const handleViewSessions = async (record: API.OnlineUserItemDto) => {
  sessionUserId.value = record.userId
  sessionUsername.value = record.nickname || record.username
  sessionModalVisible.value = true
  sessionModalLoading.value = true
  try {
    const { data } = await queryUserSessions(record.userId)
    sessionList.value = data ?? []
  } catch (error) {
    logger.error(error)
    ElMessage.error('加载会话列表失败')
  } finally {
    sessionModalLoading.value = false
  }
}

// ─── 强退 ───────────────────────────────────────────────
const handleKickUser = (record: API.OnlineUserItemDto) => {
  ElMessageBox.confirm(
    `是否确认强退用户"${record.nickname || record.username}"？该用户的所有会话将被强制下线。`,
    '系统提示',
    { type: 'warning', confirmButtonText: '确认', cancelButtonText: '取消' },
  )
    .then(async () => {
      try {
        await kickUser(record.userId)
        ElMessage.success('强退成功')
        reload()
      } catch (error) {
        logger.error(error)
      }
    })
    .catch(() => {})
}

const handleBatchKick = () => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请先选择要强退的用户')
    return
  }
  ElMessageBox.confirm(
    `是否确认强退选中的 ${selectedRows.value.length} 位用户？`,
    '批量强退确认',
    { type: 'warning', confirmButtonText: '确认', cancelButtonText: '取消' },
  )
    .then(async () => {
      try {
        await Promise.all(selectedRows.value.map((row) => kickUser(row.userId)))
        ElMessage.success('批量强退成功')
        selectedRows.value = []
        reload()
      } catch (error) {
        logger.error(error)
      }
    })
    .catch(() => {})
}

const handleKickSession = (session: API.SessionDetailDto) => {
  ElMessageBox.confirm('是否确认强退该会话？', '系统提示', {
    type: 'warning',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
  })
    .then(async () => {
      try {
        await kickSession(sessionUserId.value, session.tokenHash)
        ElMessage.success('强退会话成功')
        sessionList.value = sessionList.value.filter(
          (s) => s.tokenHash !== session.tokenHash,
        )
        reload()
      } catch (error) {
        logger.error(error)
      }
    })
    .catch(() => {})
}
</script>

<style lang="scss" scoped>
.online-user {
  &__token {
    display: inline-block;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
  }
}
</style>
