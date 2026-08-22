<template>
  <div class="profile-tab-panel">
    <el-row :gutter="16" style="row-gap: 16px">
      <!-- 外观与布局 -->
      <el-col :xs="24" :xxl="12">
        <el-card class="pref-card" size="small">
          <template #header>
            <div class="card-title">
              <icon name="SkinOutlined" />
              <span>{{ t('profile.preferences.appearance') }}</span>
            </div>
          </template>

          <div class="pref-list">
            <div
              v-for="item in appearanceItems"
              :key="item.title"
              class="pref-item"
            >
              <div class="pref-icon">
                <icon name="LayoutOutlined" />
              </div>
              <div class="pref-meta">
                <div class="pref-title">{{ item.title }}</div>
                <div class="pref-desc">{{ item.desc }}</div>
              </div>
              <div class="pref-control">
                <el-select
                  v-if="item.type === 'select'"
                  :model-value="item.value"
                  style="width: 110px"
                  @change="item.onChange"
                >
                  <el-option
                    v-for="opt in item.options"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
                <el-switch
                  v-else-if="item.type === 'switch'"
                  :model-value="item.value"
                  @change="item.onChange"
                />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 数据与功能 -->
      <el-col :xs="24" :xxl="12">
        <el-card class="pref-card" size="small">
          <template #header>
            <div class="card-title">
              <icon name="SettingOutlined" />
              <span>{{ t('profile.preferences.dataAndFeature') }}</span>
            </div>
          </template>

          <div class="pref-list">
            <div v-for="item in dataItems" :key="item.title" class="pref-item">
              <div class="pref-icon">
                <icon name="SettingOutlined" />
              </div>
              <div class="pref-meta">
                <div class="pref-title">{{ item.title }}</div>
                <div class="pref-desc">{{ item.desc }}</div>
              </div>
              <div class="pref-control">
                <el-select
                  v-if="item.type === 'select'"
                  :model-value="item.value"
                  style="width: 110px"
                  @change="item.onChange"
                >
                  <el-option
                    v-for="opt in item.options"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
                <el-switch
                  v-else-if="item.type === 'switch'"
                  :model-value="item.value"
                  @change="item.onChange"
                />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 恢复默认 -->
      <el-col :xs="24" :xxl="12">
        <el-card class="pref-card" size="small">
          <template #header>
            <div class="card-title">
              <icon name="ReloadOutlined" />
              <span>{{ t('profile.preferences.reset') }}</span>
            </div>
          </template>

          <div class="reset-section">
            <el-text type="info">
              {{
                t('profile.preferences.resetDesc', {
                  systemName: runtimeConfig.get().system.name,
                })
              }}
            </el-text>
            <el-popconfirm
              :title="t('profile.preferences.resetConfirm')"
              confirm-button-text="确认"
              cancel-button-text="取消"
              @confirm="handleReset"
            >
              <template #reference>
                <el-button>
                  <icon name="ReloadOutlined" />
                  {{ t('profile.preferences.resetButton') }}
                </el-button>
              </template>
            </el-popconfirm>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/Icon/index.vue'
import { runtimeConfig } from '@/utils/runtime-config'
import { useProfilePreferencesModel } from '../composables/useProfile'

type PrefItem = {
  title: string
  desc: string
  type: 'select' | 'switch'
  value: any
  options?: { value: string | number; label: string }[]
  onChange: (val: any) => void
}

const { t } = useI18n()
const model = useProfilePreferencesModel()
const { settingStore, handleReset } = model

const themeOptions = computed(() => [
  { value: 'light', label: t('theme.mode.light') },
  { value: 'dark', label: t('theme.mode.dark') },
  { value: 'system', label: t('theme.mode.system') },
])

const languageOptions = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en-US', label: 'English' },
]

const pageSizeOptions = [
  { value: 10, label: t('profile.preferences.pageSize10') },
  { value: 20, label: t('profile.preferences.pageSize20') },
  { value: 50, label: t('profile.preferences.pageSize50') },
]

const appearanceItems = computed<PrefItem[]>(() => [
  {
    title: t('profile.preferences.themeMode'),
    desc: t('profile.preferences.themeModeDesc'),
    type: 'select',
    value: settingStore.theme,
    options: themeOptions.value,
    onChange: model.handleThemeMode,
  },
  {
    title: t('profile.preferences.language'),
    desc: t('profile.preferences.languageDesc'),
    type: 'select',
    value: settingStore.language,
    options: languageOptions,
    onChange: model.handleLanguage,
  },
  {
    title: t('profile.preferences.sidebarCollapsed'),
    desc: t('profile.preferences.sidebarCollapsedDesc'),
    type: 'switch',
    value: settingStore.sidebarCollapsed,
    onChange: model.handleSidebarCollapsed,
  },
  {
    title: t('profile.preferences.fixedHeader'),
    desc: t('profile.preferences.fixedHeaderDesc'),
    type: 'switch',
    value: settingStore.fixedHeader,
    onChange: model.handleFixedHeader,
  },
  {
    title: t('profile.preferences.showLogo'),
    desc: t('profile.preferences.showLogoDesc'),
    type: 'switch',
    value: settingStore.showLogo,
    onChange: model.handleShowLogo,
  },
  {
    title: t('profile.preferences.sidebarTheme'),
    desc: t('profile.preferences.sidebarThemeDesc'),
    type: 'switch',
    value: settingStore.sidebarTheme === 'dark',
    onChange: model.handleSidebarTheme,
  },
  {
    title: t('profile.preferences.showBreadcrumb'),
    desc: t('profile.preferences.showBreadcrumbDesc'),
    type: 'switch',
    value: settingStore.showBreadcrumb,
    onChange: model.handleShowBreadcrumb,
  },
])

const dataItems = computed<PrefItem[]>(() => [
  {
    title: t('profile.preferences.pageSize'),
    desc: t('profile.preferences.pageSizeDesc'),
    type: 'select',
    value: settingStore.pageSize,
    options: pageSizeOptions,
    onChange: model.handlePageSize,
  },
  {
    title: t('profile.preferences.showFooter'),
    desc: t('profile.preferences.showFooterDesc'),
    type: 'switch',
    value: settingStore.showFooter,
    onChange: model.handleShowFooter,
  },
  {
    title: t('profile.preferences.colorWeak'),
    desc: t('profile.preferences.colorWeakDesc'),
    type: 'switch',
    value: settingStore.colorWeak,
    onChange: model.handleColorWeak,
  },
  {
    title: t('profile.preferences.uniqueOpened'),
    desc: t('profile.preferences.uniqueOpenedDesc'),
    type: 'switch',
    value: settingStore.uniqueOpened,
    onChange: model.handleUniqueOpened,
  },
  {
    title: t('profile.preferences.enableNotification'),
    desc: t('profile.preferences.enableNotificationDesc'),
    type: 'switch',
    value: settingStore.enableNotification,
    onChange: model.handleEnableNotification,
  },
])
</script>

<style scoped lang="scss">
.card-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.pref-list {
  display: flex;
  flex-direction: column;
}

.pref-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--gvray-color-border-secondary, #f0f0f0);

  &:last-child {
    border-bottom: none;
  }
}

.pref-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  color: var(--gvray-color-text-placeholder, #bfbfbf);
  font-size: 16px;
}

.pref-meta {
  flex: 1;
  min-width: 0;
}

.pref-title {
  font-size: 13px;
  font-weight: 500;
}

.pref-desc {
  font-size: 12px;
  color: var(--gvray-color-text-secondary, #595959);
}

.pref-control {
  flex-shrink: 0;
}

.reset-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 0;
}

@media (max-width: 576px) {
  .pref-item {
    align-items: flex-start;
    flex-direction: column;
  }

  .pref-control {
    width: 100%;
    margin-top: 8px;
  }
}
</style>
