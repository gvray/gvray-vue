<template>
  <page-container>
    <div class="profile-page">
      <section class="profile-shell">
        <section class="profile-overview">
          <section class="profile-hero">
            <div class="hero-identity">
              <el-avatar
                :size="72"
                :src="avatarSrc"
                class="avatar-ring"
                @error="handleAvatarError"
              >
                {{ avatarText }}
              </el-avatar>

              <div class="hero-main">
                <div class="hero-title-row">
                  <span class="user-name">{{ displayName }}</span>
                  <el-tag :type="statusTagType">
                    {{ accountStatusLabel }}
                  </el-tag>
                  <el-tag v-if="me?.isSuperAdmin" type="danger">
                    {{ t('profile.hero.superAdmin') }}
                  </el-tag>
                </div>
                <div class="hero-meta-line">
                  <span>@{{ me?.username || '-' }}</span>
                  <span>{{ me?.userId || '-' }}</span>
                  <span>{{ departmentName }}</span>
                  <span>{{ positionName }}</span>
                </div>
                <div class="role-tags">
                  <el-tooltip
                    v-for="role in visibleRoles"
                    :key="role.roleId"
                    :content="String(role.description || role.name)"
                    placement="top"
                    :show-after="200"
                  >
                    <el-tag type="primary" effect="light">
                      {{ role.name }}
                    </el-tag>
                  </el-tooltip>
                  <el-tooltip
                    v-if="hiddenRoles.length > 0"
                    :content="
                      hiddenRoles.map((r) => r.description || r.name).join('、')
                    "
                    placement="top"
                    :show-after="200"
                  >
                    <el-tag>+{{ hiddenRoles.length }}</el-tag>
                  </el-tooltip>
                  <el-tag v-if="!me?.roles?.length">
                    {{ t('profile.hero.noRole') }}
                  </el-tag>
                </div>
              </div>
            </div>
          </section>

          <section class="profile-summary">
            <el-card class="summary-card">
              <div class="summary-card__body">
                <div class="summary-header">
                  <div class="summary-icon">
                    <icon name="IdcardOutlined" />
                  </div>
                  <div class="summary-meta">
                    <el-text type="info">{{
                      t('profile.summary.completeness')
                    }}</el-text>
                    <div class="summary-title">
                      {{
                        t('profile.summary.completePercent', {
                          percent: completenessPercent,
                        })
                      }}
                    </div>
                  </div>
                </div>
                <el-progress
                  :percentage="completenessPercent"
                  :show-text="false"
                  :stroke-width="8"
                  :color="progressColors"
                />
                <div class="summary-rows">
                  <div class="summary-row">
                    <span>{{
                      t('profile.summary.itemsDone', {
                        done: doneCount,
                        total: completenessChecks.length,
                      })
                    }}</span>
                  </div>
                  <div class="summary-row">
                    <span>{{ t('profile.summary.accountStatus') }}</span>
                    <el-tag :type="statusTagType">
                      {{ accountStatusLabel }}
                    </el-tag>
                  </div>
                  <div class="summary-row">
                    <span>{{ t('profile.summary.updateTime') }}</span>
                    <el-text type="info">
                      <icon name="ClockCircleOutlined" />
                      {{ updatedAtText }}
                    </el-text>
                  </div>
                </div>
              </div>
            </el-card>

            <el-card class="summary-card">
              <div class="summary-card__body">
                <div class="summary-header">
                  <div class="summary-icon">
                    <icon name="TeamOutlined" />
                  </div>
                  <div class="summary-meta">
                    <el-text type="info">{{
                      t('profile.summary.contact')
                    }}</el-text>
                    <div class="summary-title">{{ departmentName }}</div>
                  </div>
                </div>
                <div class="summary-rows">
                  <div class="summary-row">
                    <span>{{ t('profile.summary.department') }}</span>
                    <el-text type="info">{{ departmentName }}</el-text>
                  </div>
                  <div class="summary-row">
                    <span>{{ t('profile.summary.position') }}</span>
                    <el-text type="info">{{ positionName }}</el-text>
                  </div>
                  <div class="summary-row">
                    <span>{{ t('profile.summary.maintain') }}</span>
                    <el-text type="info">{{
                      t('profile.summary.maintainDesc')
                    }}</el-text>
                  </div>
                </div>
              </div>
            </el-card>
          </section>
        </section>

        <main class="profile-main">
          <el-card class="tabs-card">
            <el-tabs
              v-model="activeKey"
              class="responsive-tabs"
              @tab-change="handleTabChange"
            >
              <el-tab-pane
                v-for="tab in tabMeta"
                :key="tab.key"
                :name="tab.key"
              >
                <template #label>
                  <span class="tab-label">
                    <icon :name="tab.icon" />
                    {{ tab.label }}
                  </span>
                </template>
                <component :is="tab.component" />
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </main>
      </section>
    </div>
  </page-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import PageContainer from '@/components/PageContainer/index.vue'
import Icon from '@/components/Icon/index.vue'
import { queryProfile } from '@/api/profile'
import { useProfilePageModel } from './composables/useProfile'
import TabProfile from './components/TabProfile.vue'
import TabSecurity from './components/TabSecurity.vue'
import TabPermissions from './components/TabPermissions.vue'
import TabLoginLog from './components/TabLoginLog.vue'
import TabPreferences from './components/TabPreferences.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const {
  me,
  avatarSrc: modelAvatarSrc,
  avatarText,
  displayName,
  accountStatusLabel,
  accountStatusColor,
  completenessChecks,
  doneCount,
  completenessPercent,
} = useProfilePageModel()

const avatarError = ref(false)
const avatarSrc = computed(() =>
  avatarError.value ? undefined : modelAvatarSrc.value,
)
const handleAvatarError = () => {
  avatarError.value = true
}

const statusTagType = computed(() => {
  const map: Record<string, any> = {
    green: 'success',
    red: 'danger',
    gold: 'warning',
    default: 'info',
  }
  return map[accountStatusColor.value] || 'info'
})

const departmentName = computed(
  () => me.value?.department?.name || t('profile.hero.noDepartment'),
)
const positionName = computed(
  () => me.value?.positions?.[0]?.name || t('profile.hero.noPosition'),
)

const roles = computed(() => me.value?.roles || [])
const visibleRoles = computed(() => roles.value.slice(0, 3))
const hiddenRoles = computed(() => roles.value.slice(3))

const profileDetail = ref<API.ProfileResponseDto | null>(null)

const updatedAtText = computed(() =>
  profileDetail.value?.updatedAt
    ? dayjs(profileDetail.value.updatedAt).format('YYYY-MM-DD')
    : '-',
)

onMounted(() => {
  queryProfile()
    .then((res) => {
      if (res.data) profileDetail.value = res.data
    })
    .catch(() => {
      // silent
    })
})

const progressColors = [
  { color: 'var(--gvray-color-primary)', percentage: 20 },
  { color: 'var(--gvray-color-info)', percentage: 100 },
]

const tabMeta = [
  {
    key: 'profile',
    icon: 'UserOutlined' as const,
    label: t('profile.tab.profile'),
    component: TabProfile,
  },
  {
    key: 'security',
    icon: 'LockOutlined' as const,
    label: t('profile.tab.security'),
    component: TabSecurity,
  },
  {
    key: 'permissions',
    icon: 'SafetyCertificateOutlined' as const,
    label: t('profile.tab.permissions'),
    component: TabPermissions,
  },
  {
    key: 'loginLog',
    icon: 'HistoryOutlined' as const,
    label: t('profile.tab.loginLog'),
    component: TabLoginLog,
  },
  {
    key: 'preferences',
    icon: 'SettingOutlined' as const,
    label: t('profile.tab.preferences'),
    component: TabPreferences,
  },
]

const hashKey = computed(() => route.hash.replace(/^#/, ''))
const initialKey = tabMeta.some((t) => t.key === hashKey.value)
  ? hashKey.value
  : 'profile'
const activeKey = ref(initialKey)

watch(hashKey, (key) => {
  if (key && tabMeta.some((t) => t.key === key) && key !== activeKey.value) {
    activeKey.value = key
  }
})

const handleTabChange = (key: string | number) => {
  const tabKey = String(key)
  activeKey.value = tabKey
  router.push({ path: route.path, hash: `#${tabKey}` })
}
</script>

<style lang="scss" scoped>
.profile-page {
  box-sizing: border-box;
  min-width: 0;
}

.profile-shell,
.profile-overview,
.profile-hero,
.profile-summary,
.profile-main {
  box-sizing: border-box;
  min-width: 0;
}

.profile-shell {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.profile-overview {
  display: grid;
  grid-template-columns: minmax(480px, 1.15fr) minmax(420px, 1fr);
  gap: 14px;
  align-items: stretch;
}

.profile-hero {
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 18px 20px;
  border: 1px solid var(--gvray-color-border-secondary, #f0f0f0);
  border-radius: 18px;
  background:
    radial-gradient(
      circle at 86% 18%,
      rgba(114, 46, 209, 0.18),
      transparent 32%
    ),
    radial-gradient(
      circle at 12% 88%,
      rgba(22, 119, 255, 0.14),
      transparent 28%
    ),
    linear-gradient(135deg, rgba(22, 119, 255, 0.1), rgba(114, 46, 209, 0.05)),
    var(--gvray-color-bg-container, #fff);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);

  &::before,
  &::after {
    position: absolute;
    content: '';
    pointer-events: none;
  }

  &::before {
    top: -64px;
    right: -52px;
    width: 190px;
    height: 190px;
    border: 1px solid rgb(from var(--gvray-color-primary, #1890ff) r g b / 0.16);
    border-radius: 50%;
    background: rgb(from var(--gvray-color-bg-container, #fff) r g b / 0.16);
  }

  &::after {
    right: 32px;
    bottom: 24px;
    width: 160px;
    height: 80px;
    background-image: radial-gradient(
      var(--gvray-color-primary-3, #91caff) 1px,
      transparent 1px
    );
    background-size: 14px 14px;
    opacity: 0.5;
  }
}

.hero-identity {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
}

.avatar-ring {
  flex-shrink: 0;
  border: 3px solid rgba(255, 255, 255, 0.86);
  box-shadow: 0 8px 24px rgba(22, 119, 255, 0.18);
}

.hero-main {
  flex: 1;
  min-width: 0;
}

.hero-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.user-name {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.2px;
  line-height: 1.3;
}

.hero-meta-line {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  color: var(--gvray-color-text-secondary, #595959);
  font-size: 13px;
  line-height: 1.7;

  span {
    max-width: 280px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.role-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.profile-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  min-width: 0;
}

.summary-card {
  height: 100%;
}

.summary-card__body {
  display: flex;
  height: 100%;
  min-height: 168px;
  flex-direction: column;
  gap: 10px;
}

.summary-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
}

.summary-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 11px;
  color: var(--gvray-color-primary, #1890ff);
  background: var(--gvray-color-primary-1, #e6f4ff);
  font-size: 17px;
}

.summary-meta {
  flex: 1;
  min-width: 0;
}

.summary-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--gvray-color-text, #262626);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.45;
}

.summary-rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 2px;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
  font-size: 12px;

  > span:first-child {
    flex-shrink: 0;
    color: var(--gvray-color-text-secondary, #595959);
  }
}

.profile-main {
  width: 100%;
}

.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 1200px) {
  .profile-overview {
    grid-template-columns: 1fr;
  }

  .profile-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 992px) {
  .profile-hero {
    padding: 18px;
  }
}

@media (max-width: 768px) {
  .hero-identity {
    align-items: flex-start;
  }

  .profile-summary {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .profile-shell {
    gap: 12px;
  }

  .profile-hero {
    padding: 16px;
    border-radius: 14px;
  }

  .hero-identity {
    gap: 12px;
  }

  .summary-card__body {
    min-height: auto;
  }

  .summary-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }
}
</style>
