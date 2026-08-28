<template>
  <PageContainer>
    <PageSkeleton v-if="loading" />

    <template v-else-if="role">
      <div class="auth-user-page">
        <div class="auth-user-page__layout">
          <!-- 左侧角色信息 -->
          <div class="auth-user-page__sidebar">
            <el-card shadow="never" class="auth-user-page__role-card">
              <div class="auth-user-page__role-header">
                <BackButton
                  tooltip-title="返回角色列表"
                  @click="router.push('/system/role')"
                />
                <div class="auth-user-page__role-info">
                  <div class="auth-user-page__role-name">
                    {{ role.name }}
                  </div>
                  <span class="auth-user-page__role-key">{{
                    role.roleKey
                  }}</span>
                </div>
                <el-dropdown
                  trigger="click"
                  placement="bottom-end"
                  @command="handleSwitchRole"
                >
                  <el-button text size="small">
                    <Icon name="SwapOutlined" />
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-for="item in roleOptions"
                        :key="item.roleId"
                        :command="item.roleId"
                        :disabled="item.roleId === roleId"
                      >
                        {{ item.name }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>

              <div class="auth-user-page__divider" />

              <div class="auth-user-page__info-item">
                <span class="auth-user-page__info-label">状态</span>
                <StatusTag :value="role.status" :options="dict.common_status" />
              </div>
              <div v-if="role.remark" class="auth-user-page__info-item">
                <span class="auth-user-page__info-label">描述</span>
                <el-tooltip :content="role.remark" placement="top">
                  <span class="auth-user-page__info-value">{{
                    role.remark
                  }}</span>
                </el-tooltip>
              </div>
            </el-card>

            <el-card shadow="never" class="auth-user-page__stats-card">
              <template #header>分配统计</template>
              <div class="auth-user-page__stats">
                <div
                  class="auth-user-page__stat auth-user-page__stat--highlight"
                >
                  <div class="auth-user-page__stat-num">
                    {{ selectedUserIds.length }}
                  </div>
                  <div class="auth-user-page__stat-label">已选择</div>
                </div>
                <div class="auth-user-page__stat">
                  <div class="auth-user-page__stat-num">{{ users.length }}</div>
                  <div class="auth-user-page__stat-label">总用户</div>
                </div>
              </div>
            </el-card>

            <el-card shadow="never" class="auth-user-page__assigned-card">
              <template #header>当前已分配</template>
              <div
                v-if="role.users && role.users.length > 0"
                class="auth-user-page__tags"
              >
                <el-tag
                  v-for="user in role.users"
                  :key="user.userId"
                  type="success"
                  effect="plain"
                  size="small"
                >
                  {{ user.username }}
                </el-tag>
              </div>
              <span v-else class="auth-user-page__empty-text">暂无用户</span>
            </el-card>
          </div>

          <!-- 右侧用户选择 -->
          <div class="auth-user-page__main">
            <div class="auth-user-page__action-bar">
              <el-input
                v-model="searchText"
                placeholder="搜索用户名、昵称或邮箱"
                clearable
                style="width: 200px"
                @input="onSearchInput"
                @clear="onSearchClear"
              >
                <template #prefix><Icon name="ElSearch" /></template>
              </el-input>
              <el-button @click="handleSelectAll">全选</el-button>
              <el-button @click="handleClearAll">清空</el-button>
              <el-button @click="handleReset">
                <template #icon><Icon name="ElRefreshLeft" /></template>
                重置</el-button
              >
              <el-button
                v-hasPermi="[PERM.ROLE_UPDATE_USERS]"
                type="primary"
                :loading="submitting"
                :disabled="!hasChanges"
                @click="handleSubmit"
              >
                <template #icon><Icon name="ElCircleCheck" /></template>
                保存
              </el-button>
            </div>

            <div class="auth-user-page__content-body">
              <div v-if="users.length > 0" class="auth-user-page__user-grid">
                <div
                  v-for="user in users"
                  :key="user.userId"
                  class="auth-user-page__user-item"
                  :class="{
                    'auth-user-page__user-item--selected':
                      selectedUserIds.includes(user.userId),
                  }"
                  @click="toggleUser(user.userId)"
                >
                  <div class="auth-user-page__user-check">
                    <Icon
                      v-if="selectedUserIds.includes(user.userId)"
                      name="ElCheck"
                    />
                  </div>
                  <div class="auth-user-page__user-header">
                    <div class="auth-user-page__user-avatar">
                      <img v-if="user.avatar" :src="user.avatar" alt="avatar" />
                      <template v-else>{{
                        (user.username || '?').charAt(0).toUpperCase()
                      }}</template>
                    </div>
                    <div class="auth-user-page__user-info">
                      <div class="auth-user-page__user-name">
                        {{ user.username }}
                      </div>
                      <div class="auth-user-page__user-account">
                        {{ user.nickname || '-' }}
                      </div>
                    </div>
                  </div>
                  <div class="auth-user-page__user-meta">
                    <span>{{ user.email || '-' }}</span>
                  </div>
                </div>
              </div>

              <div v-else class="auth-user-page__empty">
                <Icon
                  name="ElUserFilled"
                  class-name="auth-user-page__empty-icon"
                />
                <div>
                  {{ searchText ? '未找到匹配的用户' : '暂无可分配的用户' }}
                </div>
              </div>

              <div v-if="hasMore" class="auth-user-page__load-more">
                <el-button :loading="userLoading" @click="loadMoreUsers">
                  加载更多（{{ users.length }}/{{ total }}）
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="auth-user-page__not-found">
      <div class="auth-user-page__empty">
        <Icon name="ElUserFilled" class-name="auth-user-page__empty-icon" />
        <div>{{ roleId ? '未找到角色信息' : '请提供角色ID来分配用户' }}</div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { debounce } from '@gvray/eskit'
import { getRoleById, assignRoleUsers, queryRoleOptions } from '@/api/role'
import { queryUserList } from '@/api/user'
import { useSettingStore } from '@/stores'
import { PERM } from '@/constants/permission'
import { useDict } from '@/composables/useDict'
import { logger } from '@/utils'

const route = useRoute()
const router = useRouter()
const settingStore = useSettingStore()

const roleId = route.params.roleId as string
const dict = useDict(['common_status'])

const loading = ref(false)
const submitting = ref(false)
const role = ref<API.RoleResponseDto | null>(null)
const roleOptions = ref<API.RoleResponseDto[]>([])

const users = ref<API.UserResponseDto[]>([])
const total = ref(0)
const page = ref(1)
const hasMore = ref(false)
const userLoading = ref(false)
const selectedUserIds = ref<string[]>([])
const originalUserIds = ref<string[]>([])
const searchText = ref('')

const hasChanges = computed(() => {
  const orig = [...originalUserIds.value].sort()
  const curr = [...selectedUserIds.value].sort()
  if (orig.length !== curr.length) return true
  return orig.some((id, i) => id !== curr[i])
})

const fetchUserList = async (opts?: { keyword?: string; append?: boolean }) => {
  userLoading.value = true
  try {
    const currentPage = opts?.append ? page.value + 1 : 1
    const { data } = await queryUserList({
      page: currentPage,
      pageSize: settingStore.pageSize,
      keyword: opts?.keyword,
    })
    const items = data?.items || []
    users.value = opts?.append ? [...users.value, ...items] : items
    page.value = currentPage
    total.value = data?.total || 0
    hasMore.value = users.value.length < (data?.total || 0)
  } catch (error) {
    logger.error(error)
  } finally {
    userLoading.value = false
  }
}

const fetchRoleDetail = async () => {
  try {
    const { data } = await getRoleById(roleId)
    role.value = data ?? null
    const ids = role.value?.users?.map((u) => u.userId) || []
    selectedUserIds.value = [...ids]
    originalUserIds.value = [...ids]
  } catch (error) {
    logger.error(error)
    role.value = null
  }
}

const initializeData = async () => {
  if (!roleId) return
  loading.value = true
  try {
    await Promise.all([fetchUserList(), fetchRoleDetail()])
    const { data } = await queryRoleOptions()
    roleOptions.value = data ?? []
  } catch (error) {
    logger.error(error)
  } finally {
    loading.value = false
  }
}

const debouncedSearch = debounce((keyword: string) => {
  fetchUserList({ keyword })
}, 300)

const onSearchInput = (value: string) => {
  debouncedSearch(value)
}

const onSearchClear = () => {
  fetchUserList()
}

const loadMoreUsers = () => {
  if (!hasMore.value || userLoading.value) return
  fetchUserList({ keyword: searchText.value, append: true })
}

const toggleUser = (userId: string) => {
  const idx = selectedUserIds.value.indexOf(userId)
  if (idx >= 0) selectedUserIds.value.splice(idx, 1)
  else selectedUserIds.value.push(userId)
}

const handleSelectAll = () => {
  selectedUserIds.value = users.value.map((u) => u.userId)
}

const handleClearAll = () => {
  selectedUserIds.value = []
}

const handleReset = () => {
  selectedUserIds.value = [...originalUserIds.value]
}

const handleSubmit = async () => {
  if (!role.value) return
  submitting.value = true
  try {
    await assignRoleUsers(roleId, { userIds: selectedUserIds.value })
    ElMessage.success('用户分配成功')
    await fetchRoleDetail()
  } catch (error) {
    logger.error(error)
  } finally {
    submitting.value = false
  }
}

const handleSwitchRole = (targetRoleId: string) => {
  if (targetRoleId === roleId) return
  router.push(`/system/role-auth/user/${targetRoleId}`)
}

onMounted(initializeData)
onUnmounted(() => debouncedSearch.cancel())
</script>

<style lang="scss" scoped>
.auth-user-page {
  &__layout {
    display: flex;
    gap: 16px;
    align-items: flex-start;

    @media (max-width: 1200px) {
      flex-direction: column;
    }
  }

  &__sidebar {
    width: 280px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;

    @media (max-width: 1200px) {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: stretch;
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  &__role-card,
  &__stats-card {
    height: 100%;
  }

  &__assigned-card {
    @media (max-width: 1200px) {
      grid-column: 1 / -1;
    }
  }

  &__role-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__role-info {
    flex: 1;
    min-width: 0;
  }

  &__role-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--gvray-color-text-heading, var(--el-text-color-primary));
    margin-bottom: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__role-key {
    font-size: 12px;
    color: var(--gvray-color-primary, var(--el-color-primary));
    background: var(--gvray-color-primary-bg, var(--el-color-primary-light-9));
    padding: 2px 8px;
    border-radius: 4px;
    display: inline-block;
    font-family: 'SF Mono', Monaco, monospace;
  }

  &__divider {
    border-top: 1px solid var(--gvray-color-border, var(--el-border-color));
    margin: 16px 0;
  }

  &__info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    font-size: 13px;
  }

  &__info-label {
    color: var(--gvray-color-text-secondary, var(--el-text-color-secondary));
  }

  &__info-value {
    max-width: 150px;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--gvray-color-text-heading, var(--el-text-color-primary));
    font-weight: 500;
  }

  &__stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  &__stat {
    background: var(
      --gvray-color-fill-quaternary,
      var(--el-fill-color-lighter)
    );
    border: 1px solid var(--gvray-color-border, var(--el-border-color));
    border-radius: 8px;
    padding: 10px 8px;
    text-align: center;

    &--highlight {
      background: var(
        --gvray-color-primary-bg,
        var(--el-color-primary-light-9)
      );
      border-color: var(
        --gvray-color-primary-border,
        var(--el-color-primary-light-5)
      );

      .auth-user-page__stat-num {
        color: var(--gvray-color-primary, var(--el-color-primary));
      }
    }
  }

  &__stat-num {
    font-size: 20px;
    font-weight: 600;
    color: var(--gvray-color-text-heading, var(--el-text-color-primary));
    line-height: 1;
    margin-bottom: 4px;
  }

  &__stat-label {
    font-size: 11px;
    color: var(--gvray-color-text-secondary, var(--el-text-color-secondary));
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  &__empty-text {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__main {
    flex: 1;
    min-width: 0;
    background: var(--gvray-color-bg-container, var(--el-bg-color));
    border: 1px solid var(--gvray-color-border, var(--el-border-color));
    border-radius: 8px;
    overflow: hidden;

    @media (max-width: 1200px) {
      width: 100%;
    }
  }

  &__action-bar {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--gvray-color-border, var(--el-border-color));
    flex-wrap: wrap;
    box-sizing: border-box;
  }

  &__content-body {
    padding: 12px 16px;
    box-sizing: border-box;
  }

  &__user-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 10px;
  }

  &__user-item {
    position: relative;
    height: 96px;
    padding: 12px;
    border-radius: 8px;
    background: var(--gvray-color-bg-container, var(--el-bg-color));
    border: 1px solid
      var(--gvray-color-border-secondary, var(--el-border-color));
    cursor: pointer;
    transition:
      background 0.2s,
      border-color 0.2s;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    user-select: none;

    &:hover {
      background: var(--gvray-color-bg-elevated, var(--el-fill-color-light));
    }

    &--selected {
      background: var(
        --gvray-color-primary-bg,
        var(--el-color-primary-light-9)
      );
      border-color: var(--gvray-color-primary-border, var(--el-color-primary));

      .auth-user-page__user-check {
        opacity: 1;
      }
    }
  }

  &__user-check {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--gvray-color-primary, var(--el-color-primary));
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &__user-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  &__user-avatar {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: linear-gradient(
      135deg,
      var(--gvray-color-primary, var(--el-color-primary)) 0%,
      var(--gvray-color-primary-hover, var(--el-color-primary-light-3)) 100%
    );
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    flex-shrink: 0;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__user-info {
    flex: 1;
    min-width: 0;
  }

  &__user-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--gvray-color-text-heading, var(--el-text-color-primary));
    margin-bottom: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__user-account {
    font-size: 12px;
    color: var(--gvray-color-text-secondary, var(--el-text-color-secondary));
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__user-meta {
    font-size: 12px;
    color: var(--gvray-color-text-secondary, var(--el-text-color-secondary));
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__load-more {
    text-align: center;
    padding-top: 14px;

    :deep(.el-button) {
      min-width: 160px;
      height: 32px;
      border: none;
      border-radius: 16px;
      color: var(--gvray-color-text-secondary, var(--el-text-color-secondary));
      background: var(
        --gvray-color-fill-quaternary,
        var(--el-fill-color-lighter)
      );

      &:hover {
        color: var(--gvray-color-primary, var(--el-color-primary));
        background: var(
          --gvray-color-primary-bg,
          var(--el-color-primary-light-9)
        );
      }
    }
  }

  &__empty {
    text-align: center;
    color: var(--gvray-color-text-secondary, var(--el-text-color-secondary));
    padding: 60px 20px;
  }

  &__empty-icon {
    font-size: 48px;
    color: var(--gvray-color-text-disabled, var(--el-text-color-disabled));
    margin-bottom: 16px;
    opacity: 0.3;
  }

  &__not-found {
    padding: 40px 0;
  }
}
</style>
