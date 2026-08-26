<template>
  <PageContainer>
    <div v-if="loading" class="auth-role-page__loading">
      <el-skeleton :rows="8" animated />
    </div>

    <template v-else-if="user">
      <div class="auth-role-page">
        <div class="auth-role-page__layout">
          <!-- 左侧用户信息 -->
          <div class="auth-role-page__sidebar">
            <el-card shadow="never" class="auth-role-page__user-card">
              <div class="auth-role-page__user-header">
                <BackButton
                  tooltip-title="返回用户列表"
                  @click="router.push('/system/user')"
                />
                <div class="auth-role-page__user-info">
                  <div class="auth-role-page__user-name">
                    {{ user.nickname || user.username }}
                  </div>
                  <div class="auth-role-page__user-account">
                    @{{ user.username }}
                  </div>
                </div>
              </div>

              <div class="auth-role-page__divider" />

              <div class="auth-role-page__info-item">
                <span class="auth-role-page__info-label">邮箱</span>
                <span class="auth-role-page__info-value">{{
                  user.email || '-'
                }}</span>
              </div>
              <div class="auth-role-page__info-item">
                <span class="auth-role-page__info-label">状态</span>
                <StatusTag :value="user.status" :options="dict.user_status" />
              </div>
            </el-card>

            <el-card shadow="never" class="auth-role-page__stats-card">
              <template #header>分配统计</template>
              <div class="auth-role-page__stats">
                <div
                  class="auth-role-page__stat auth-role-page__stat--highlight"
                >
                  <div class="auth-role-page__stat-num">
                    {{ selectedRoleIds.length }}
                  </div>
                  <div class="auth-role-page__stat-label">已选择</div>
                </div>
                <div class="auth-role-page__stat">
                  <div class="auth-role-page__stat-num">{{ roles.length }}</div>
                  <div class="auth-role-page__stat-label">总角色</div>
                </div>
              </div>
            </el-card>

            <el-card shadow="never" class="auth-role-page__assigned-card">
              <template #header>当前已分配</template>
              <div
                v-if="user.roles && user.roles.length > 0"
                class="auth-role-page__tags"
              >
                <el-tag
                  v-for="role in user.roles"
                  :key="role.roleId"
                  type="primary"
                  effect="plain"
                  size="small"
                >
                  {{ role.name }}
                </el-tag>
              </div>
              <span v-else class="auth-role-page__empty-text">暂无角色</span>
            </el-card>
          </div>

          <!-- 右侧角色选择 -->
          <div class="auth-role-page__main">
            <div class="auth-role-page__action-bar">
              <el-button @click="handleSelectAll">全选</el-button>
              <el-button @click="handleClearAll">清空</el-button>
              <el-button :icon="RefreshLeft" @click="handleReset"
                >重置</el-button
              >
              <AuthButton
                type="primary"
                :icon="CircleCheck"
                :loading="submitting"
                :disabled="!hasChanges"
                :perms="[PERM.USER_UPDATE_ROLES]"
                @click="handleSubmit"
              >
                保存
              </AuthButton>
            </div>

            <div class="auth-role-page__content-body">
              <div v-if="roles.length > 0" class="auth-role-page__role-grid">
                <div
                  v-for="role in roles"
                  :key="role.roleId"
                  class="auth-role-page__role-item"
                  :class="{
                    'auth-role-page__role-item--selected':
                      selectedRoleIds.includes(role.roleId),
                  }"
                  @click="toggleRole(role.roleId)"
                >
                  <div class="auth-role-page__role-check">
                    <el-icon v-if="selectedRoleIds.includes(role.roleId)"
                      ><Check
                    /></el-icon>
                  </div>
                  <div class="auth-role-page__role-name">{{ role.name }}</div>
                  <div v-if="role.roleKey" class="auth-role-page__role-key">
                    {{ role.roleKey }}
                  </div>
                  <div v-if="role.remark" class="auth-role-page__role-desc">
                    {{ role.remark }}
                  </div>
                </div>
              </div>

              <div v-else class="auth-role-page__empty">
                <el-icon class="auth-role-page__empty-icon"
                  ><UserFilled
                /></el-icon>
                <div>暂无可分配的角色</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="auth-role-page__not-found">
      <div class="auth-role-page__empty">
        <el-icon class="auth-role-page__empty-icon"><UserFilled /></el-icon>
        <div>{{ userId ? '未找到用户信息' : '请提供用户ID来分配角色' }}</div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Check,
  RefreshLeft,
  CircleCheck,
  UserFilled,
} from '@element-plus/icons-vue'
import { getUserById, assignUserRoles } from '@/api/user'
import { queryRoleOptions } from '@/api/role'
import { PERM } from '@/constants/permission'
import { useDict } from '@/composables/useDict'
import { logger } from '@/utils'

const route = useRoute()
const router = useRouter()

const userId = route.params.userId as string
const dict = useDict(['user_status'])

const loading = ref(false)
const submitting = ref(false)
const user = ref<API.UserResponseDto | null>(null)
const roles = ref<API.RoleResponseDto[]>([])
const selectedRoleIds = ref<string[]>([])
const originalRoleIds = ref<string[]>([])

const hasChanges = computed(() => {
  const orig = [...originalRoleIds.value].sort()
  const curr = [...selectedRoleIds.value].sort()
  if (orig.length !== curr.length) return true
  return orig.some((id, i) => id !== curr[i])
})

const loadData = async () => {
  if (!userId) return
  loading.value = true
  try {
    const [userRes, roleRes] = await Promise.all([
      getUserById(userId),
      queryRoleOptions(),
    ])
    if (userRes.data) {
      user.value = userRes.data
      const ids = userRes.data.roles?.map((r) => r.roleId) || []
      selectedRoleIds.value = [...ids]
      originalRoleIds.value = [...ids]
    }
    if (roleRes.data) roles.value = roleRes.data
  } catch (error) {
    logger.error(error)
  } finally {
    loading.value = false
  }
}

const toggleRole = (roleId: string) => {
  const idx = selectedRoleIds.value.indexOf(roleId)
  if (idx >= 0) {
    selectedRoleIds.value.splice(idx, 1)
  } else {
    selectedRoleIds.value.push(roleId)
  }
}

const handleSelectAll = () => {
  selectedRoleIds.value = roles.value.map((r) => r.roleId)
}

const handleClearAll = () => {
  selectedRoleIds.value = []
}

const handleReset = () => {
  selectedRoleIds.value = [...originalRoleIds.value]
}

const handleSubmit = async () => {
  if (!user.value) return
  submitting.value = true
  try {
    await assignUserRoles(userId, { roleIds: selectedRoleIds.value })
    ElMessage.success('角色分配成功')
    // 刷新用户数据，同步 originalRoleIds
    const res = await getUserById(userId)
    if (res.data) {
      user.value = res.data
      const ids = res.data.roles?.map((r) => r.roleId) || []
      originalRoleIds.value = [...ids]
      selectedRoleIds.value = [...ids]
    }
  } catch (error) {
    logger.error(error)
  } finally {
    submitting.value = false
  }
}

onMounted(loadData)
</script>

<style lang="scss" scoped>
.auth-role-page {
  &__loading {
    padding: 24px;
  }

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

  &__user-card,
  &__stats-card {
    height: 100%;
  }

  &__assigned-card {
    @media (max-width: 1200px) {
      grid-column: 1 / -1;
    }
  }

  &__user-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__user-info {
    flex: 1;
    min-width: 0;
  }

  &__user-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--gvray-color-text-heading, var(--el-text-color-primary));
    margin-bottom: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__user-account {
    font-size: 13px;
    color: var(--gvray-color-text-secondary, var(--el-text-color-secondary));
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

      .auth-role-page__stat-num {
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

  &__role-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
  }

  &__role-item {
    position: relative;
    padding: 14px;
    min-height: 110px;
    border-radius: 8px;
    background: var(--gvray-color-bg-container, var(--el-bg-color));
    border: 1px solid
      var(--gvray-color-border-secondary, var(--el-border-color));
    cursor: pointer;
    transition:
      background 0.2s,
      border-color 0.2s;
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

      .auth-role-page__role-check {
        opacity: 1;
      }
    }
  }

  &__role-check {
    position: absolute;
    top: 8px;
    right: 8px;
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

  &__role-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--gvray-color-text-heading, var(--el-text-color-primary));
    margin-bottom: 6px;
    padding-right: 24px;
  }

  &__role-key {
    font-size: 12px;
    color: var(--gvray-color-primary, var(--el-color-primary));
    background: var(--gvray-color-primary-bg, var(--el-color-primary-light-9));
    padding: 2px 8px;
    border-radius: 4px;
    display: inline-block;
    margin-bottom: 8px;
    font-family: 'SF Mono', Monaco, monospace;
  }

  &__role-desc {
    font-size: 12px;
    color: var(--gvray-color-text-secondary, var(--el-text-color-secondary));
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
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
  }

  &__not-found {
    padding: 40px 0;
  }
}
</style>
