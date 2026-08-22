<template>
  <div class="profile-tab-panel">
    <el-alert
      type="info"
      :closable="false"
      show-icon
      class="profile-notice"
      :title="t('profile.profile.alert')"
    />

    <el-card class="module-card">
      <template #header>
        <div class="card-title">
          <icon name="IdcardOutlined" />
          <span>{{ t('profile.profile.basicInfo') }}</span>
        </div>
      </template>

      <el-descriptions :column="descColumn" :colon="false">
        <el-descriptions-item :label="t('profile.profile.username')">
          <span class="readonly-field">
            {{ currentMe?.username || '-' }}
            <icon name="LockOutlined" />
          </span>
        </el-descriptions-item>

        <el-descriptions-item :label="t('profile.profile.nickname')">
          {{ userProfile?.nickname || '-' }}
        </el-descriptions-item>

        <el-descriptions-item
          :label="t('profile.profile.userId')"
          :span="descColumn"
        >
          <el-text type="info">{{ currentMe?.userId || '-' }}</el-text>
        </el-descriptions-item>

        <el-descriptions-item :label="t('profile.profile.email')">
          <div class="binding-row">
            <span>{{ email || t('profile.profile.unbound') }}</span>
            <el-tooltip
              :content="
                emailBound
                  ? t('profile.profile.bound')
                  : t('profile.profile.unbound')
              "
            >
              <icon
                :name="
                  emailBound ? 'CheckCircleFilled' : 'ExclamationCircleFilled'
                "
                :class="emailBound ? 'verified-icon' : 'unverified-icon'"
              />
            </el-tooltip>
          </div>
        </el-descriptions-item>

        <el-descriptions-item :label="t('profile.profile.phone')">
          <div class="binding-row">
            <span>{{ maskedPhone || t('profile.profile.unbound') }}</span>
            <el-tooltip
              :content="
                phoneBound
                  ? t('profile.profile.bound')
                  : t('profile.profile.unbound')
              "
            >
              <icon
                :name="
                  phoneBound ? 'CheckCircleFilled' : 'ExclamationCircleFilled'
                "
                :class="phoneBound ? 'verified-icon' : 'unverified-icon'"
              />
            </el-tooltip>
          </div>
        </el-descriptions-item>

        <el-descriptions-item :label="t('profile.profile.department')">
          <span class="readonly-field">
            {{ currentMe?.department?.name || t('profile.profile.notSet') }}
            <icon name="LockOutlined" />
          </span>
        </el-descriptions-item>

        <el-descriptions-item :label="t('profile.profile.position')">
          <span class="readonly-field">
            {{ currentMe?.positions?.[0]?.name || t('profile.profile.notSet') }}
            <icon name="LockOutlined" />
          </span>
        </el-descriptions-item>

        <el-descriptions-item
          :label="t('profile.profile.roles')"
          :span="descColumn"
        >
          <div class="role-tags">
            <el-tooltip
              v-for="role in currentMe?.roles"
              :key="role.roleId"
              :content="String(role.description || role.name)"
              placement="top"
              :show-after="200"
            >
              <el-tag type="primary" effect="light">
                {{ role.name }}
              </el-tag>
            </el-tooltip>
            <el-text v-if="!currentMe?.roles?.length" type="info">
              {{ t('profile.profile.noRole') }}
            </el-text>
          </div>
        </el-descriptions-item>

        <el-descriptions-item
          :label="t('profile.profile.status')"
          :span="descColumn"
        >
          <el-tag :type="statusTagType">{{ statusMeta.label }}</el-tag>
        </el-descriptions-item>

        <el-descriptions-item :label="t('profile.profile.registerTime')">
          <span class="readonly-field">
            -
            <icon name="LockOutlined" />
          </span>
        </el-descriptions-item>

        <el-descriptions-item :label="t('profile.profile.updateTime')">
          <span class="readonly-field">
            {{ formattedUpdateAt }}
            <icon name="LockOutlined" />
          </span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import Icon from '@/components/Icon/index.vue'
import { queryProfile } from '@/api/profile'
import { useAuthStore } from '@/stores'
import {
  getAccountStatusMeta,
  useProfileResponsive,
} from '../composables/useProfile'

const { t } = useI18n()
const authStore = useAuthStore()
const { isMd } = useProfileResponsive()

const currentMe = computed(() => authStore.profile)
const userProfile = computed(
  () => (currentMe.value as any)?.profile as API.ProfileResponseDto | undefined,
)

const descColumn = computed(() => (isMd.value ? 2 : 1))

const statusMeta = computed(() =>
  getAccountStatusMeta(
    (currentMe.value as any)?.profile
      ?.status as API.CurrentUserProfileDto['status'],
  ),
)

const statusTagType = computed(() => {
  const map: Record<string, any> = {
    green: 'success',
    red: 'danger',
    gold: 'warning',
    default: 'info',
  }
  return map[statusMeta.value.color] || 'info'
})

const email = computed(() => (userProfile.value?.email as string) || '')
const phone = computed(() => (userProfile.value?.phone as string) || '')
const emailBound = computed(() => !!email.value)
const phoneBound = computed(() => !!phone.value)
const maskedPhone = computed(() =>
  phone.value ? phone.value.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '',
)

const formattedUpdateAt = computed(() =>
  userProfile.value?.updatedAt
    ? dayjs(userProfile.value.updatedAt).format('YYYY-MM-DD HH:mm:ss')
    : '-',
)

const fetchedProfile = ref<API.ProfileResponseDto | undefined>(undefined)

onMounted(() => {
  queryProfile()
    .then((res) => {
      if (res.data) fetchedProfile.value = res.data
    })
    .catch(() => {
      // silent
    })
})
</script>

<style scoped lang="scss">
.profile-tab-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
