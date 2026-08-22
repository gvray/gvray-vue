<template>
  <el-dropdown @command="handleClick">
    <div class="navbar-action-item theme-mode-switch">
      <Icon :name="iconName" :size="18" />
      <span class="theme-mode-switch__label">{{
        $t(THEME_MODE_INTL_KEYS[settingStore.theme])
      }}</span>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="[key, id] in themeOptions"
          :key="key"
          :command="key"
          :class="{ active: settingStore.theme === key }"
        >
          <Icon
            :name="ICON_MAP[key]"
            :size="16"
            class-name="theme-mode-switch__icon"
          />
          {{ $t(id) }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSettingStore } from '@/stores/setting'
import Icon from '@/components/Icon/index.vue'
import type { ThemeMode } from '@/constants/theme'

const ICON_MAP: Record<ThemeMode, string> = {
  light: 'gvray-theme-light',
  dark: 'gvray-theme-dark',
  system: 'gvray-theme-system',
}

const THEME_MODE_INTL_KEYS: Record<ThemeMode, string> = {
  light: 'theme.mode.light',
  dark: 'theme.mode.dark',
  system: 'theme.mode.system',
}

const settingStore = useSettingStore()

const iconName = computed(() => ICON_MAP[settingStore.theme])

const themeOptions = computed(
  () => Object.entries(THEME_MODE_INTL_KEYS) as [ThemeMode, string][],
)

const handleClick = (key: ThemeMode) => {
  settingStore.setTheme(key)
}
</script>

<style scoped>
.theme-mode-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.theme-mode-switch__label {
  font-size: 14px;
}

.theme-mode-switch__icon {
  margin-right: 6px;
}

.active {
  color: var(--gvray-color-primary);
}
</style>
