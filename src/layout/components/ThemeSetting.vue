<template>
  <el-dropdown
    ref="dropdownRef"
    placement="bottom-end"
    trigger="click"
    :show-arrow="false"
    :hide-on-click="false"
    :popper-style="{ width: '220px' }"
  >
    <div class="navbar-action-item theme-setting">
      <Icon name="gvray-theme-primary" :size="18" />
      <span>{{ $t('theme.setting.title') }}</span>
    </div>

    <template #dropdown>
      <div class="theme-setting__panel">
        <div class="theme-setting__title">{{ $t('theme.setting.title') }}</div>
        <div class="theme-setting__colors">
          <div
            v-for="item in colorList"
            :key="item.color"
            class="theme-color-item"
            :class="{ active: settingStore.colorPrimary === item.color }"
            :style="{ backgroundColor: item.color }"
            :title="item.label"
            @click="handleSelect(item.color)"
          >
            <el-icon
              v-if="settingStore.colorPrimary === item.color"
              :size="16"
              color="#fff"
            >
              <Check />
            </el-icon>
          </div>
        </div>
      </div>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check } from '@element-plus/icons-vue'
import { useSettingStore } from '@/stores/setting'
import Icon from '@/components/Icon/index.vue'
import { PRIMARY_COLOR_INTL_KEYS, type ColorPrimary } from '@/constants/theme'

const { t } = useI18n()
const settingStore = useSettingStore()
const dropdownRef = ref<any>(null)

const colorList = computed(() =>
  (Object.entries(PRIMARY_COLOR_INTL_KEYS) as [ColorPrimary, string][]).map(
    ([color, id]) => ({ color, label: t(id) }),
  ),
)

const handleSelect = (color: ColorPrimary) => {
  settingStore.setColorPrimary(color)
  dropdownRef.value?.handleClose?.()
}
</script>

<style scoped lang="scss">
.theme-setting {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.theme-setting__panel {
  padding: 12px;
}

.theme-setting__title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--gvray-color-text);
}

.theme-setting__colors {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.theme-color-item {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }

  &.active {
    box-shadow:
      0 0 0 2px #fff,
      0 0 0 3px var(--gvray-color-primary);
  }
}
</style>
