<template>
  <div class="profile-tab-panel security-grid">
    <el-card class="module-card">
      <template #header>
        <div class="card-title">
          <icon name="KeyOutlined" />
          <span>{{ t('profile.security.changePassword') }}</span>
        </div>
      </template>

      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="security-alert"
        :title="t('profile.security.passwordAlert')"
      />

      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <el-form-item
          prop="oldPassword"
          :label="t('profile.security.oldPassword')"
          :rules="[
            {
              required: true,
              message: t('profile.security.oldPasswordRequired'),
              trigger: 'blur',
            },
          ]"
        >
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            show-password
            :placeholder="t('profile.security.oldPassword')"
          />
        </el-form-item>

        <el-form-item
          prop="newPassword"
          :label="t('profile.security.newPassword')"
          :rules="[
            {
              required: true,
              message: t('profile.security.newPasswordRequired'),
              trigger: 'blur',
            },
            {
              min: 8,
              message: t('profile.security.newPasswordMin'),
              trigger: 'blur',
            },
          ]"
        >
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
            :placeholder="t('profile.security.newPassword')"
          />
        </el-form-item>

        <el-form-item
          prop="confirmPassword"
          :label="t('profile.security.confirmPassword')"
          :rules="[
            {
              required: true,
              message: t('profile.security.confirmPasswordRequired'),
              trigger: 'blur',
            },
            { validator: validateConfirmPassword, trigger: 'blur' },
          ]"
        >
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
            :placeholder="t('profile.security.confirmPassword')"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="passwordLoading"
            style="width: 100%"
            @click="handleSubmit"
          >
            {{ t('profile.security.submit') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="module-card">
      <template #header>
        <div class="card-title">
          <icon name="SafetyCertificateOutlined" />
          <span>{{ t('profile.security.suggestions') }}</span>
        </div>
      </template>

      <div class="security-list">
        <div
          v-for="item in suggestionList"
          :key="item.title"
          class="security-list-item"
        >
          <div
            :class="[
              'security-list-icon',
              item.ok ? 'safe-icon' : 'muted-icon',
            ]"
          >
            <icon :name="item.icon" />
          </div>
          <div class="security-list-content">
            <div class="security-list-title">
              <span>{{ item.title }}</span>
              <el-tag :type="item.ok ? 'success' : 'info'">
                {{
                  item.ok
                    ? t('profile.security.done')
                    : t('profile.security.todo')
                }}
              </el-tag>
            </div>
            <el-text type="info">{{ item.desc }}</el-text>
          </div>
        </div>
      </div>

      <el-alert
        type="success"
        :closable="false"
        show-icon
        class="security-alert"
        :title="t('profile.security.tip')"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FormInstance, FormItemRule } from 'element-plus'
import Icon from '@/components/Icon/index.vue'
import { useProfileSecurityModel } from '../composables/useProfile'

const { t } = useI18n()

const passwordFormRef = ref<FormInstance>()
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const { profile, passwordLoading, handleChangePassword } =
  useProfileSecurityModel(passwordFormRef)

const userProfile = computed(
  () => (profile.value as any)?.profile as API.ProfileResponseDto | undefined,
)
const emailBound = computed(() => !!userProfile.value?.email)
const phoneBound = computed(() => !!userProfile.value?.phone)

const maskedPhone = computed(() => {
  const phone = userProfile.value?.phone
  return phone ? phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : ''
})

const suggestionList = computed(() => [
  {
    icon: 'MailOutlined',
    title: t('profile.security.emailBind'),
    desc: emailBound.value
      ? String(userProfile.value?.email)
      : t('profile.security.emailUnboundDesc'),
    ok: emailBound.value,
  },
  {
    icon: 'MobileOutlined',
    title: t('profile.security.phoneBind'),
    desc: phoneBound.value
      ? maskedPhone.value
      : t('profile.security.phoneUnboundDesc'),
    ok: phoneBound.value,
  },
  {
    icon: 'LockOutlined',
    title: t('profile.security.loginRecord'),
    desc: t('profile.security.loginRecordDesc'),
    ok: true,
  },
])

const validateConfirmPassword: FormItemRule['validator'] = (
  _rule,
  value,
  callback,
) => {
  if (!value || value === passwordForm.newPassword) {
    callback()
  } else {
    callback(new Error(t('profile.security.confirmPasswordMismatch')))
  }
}

const handleSubmit = async () => {
  const valid = await passwordFormRef.value?.validate().catch(() => false)
  if (!valid) return
  await handleChangePassword({
    oldPassword: passwordForm.oldPassword,
    newPassword: passwordForm.newPassword,
    confirmPassword: passwordForm.confirmPassword,
  })
}
</script>

<style scoped lang="scss">
.security-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 16px;
  min-width: 0;
}

.security-alert {
  margin-bottom: 16px;
}

.card-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.security-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.security-list-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.security-list-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  font-size: 18px;
}

.safe-icon {
  color: var(--gvray-color-success, #52c41a);
}

.muted-icon {
  color: var(--gvray-color-text-placeholder, #bfbfbf);
}

.security-list-content {
  flex: 1;
  min-width: 0;
}

.security-list-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 600;
}

.readonly-field {
  color: var(--gvray-color-text-secondary, #595959);

  .icon {
    margin-left: 6px;
    color: var(--gvray-color-text-placeholder, #bfbfbf);
    font-size: 11px;
  }
}

.binding-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.verified-icon {
  color: var(--gvray-color-success, #52c41a);
  font-size: 13px;
}

.unverified-icon {
  color: var(--gvray-color-warning, #faad14);
  font-size: 13px;
}

@media (max-width: 576px) {
  .security-grid {
    grid-template-columns: 1fr;
  }

  .security-list-item {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
