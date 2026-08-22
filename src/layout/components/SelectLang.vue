<template>
  <el-dropdown @command="changeLang">
    <div class="navbar-action-item select-lang" :title="currentLabel?.title">
      <Icon name="gvray-language" :size="18" />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="locale in locales"
          :key="locale.lang"
          :command="locale.lang"
          :class="{ active: settingStore.language === locale.lang }"
        >
          <span class="select-lang__icon">{{ locale.icon }}</span>
          {{ locale.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSettingStore } from '@/stores/setting'
import { setI18nLanguage, type SupportedLocale } from '@/locales'
import Icon from '@/components/Icon/index.vue'

interface LocaleData {
  lang: SupportedLocale
  label: string
  icon: string
  title: string
}

const locales: LocaleData[] = [
  { lang: 'zh-CN', label: '简体中文', icon: '🇨🇳', title: '语言' },
  { lang: 'en-US', label: 'English', icon: '🇺🇸', title: 'Language' },
]

const settingStore = useSettingStore()

const currentLabel = computed(() =>
  locales.find((item) => item.lang === settingStore.language),
)

const changeLang = (command: SupportedLocale) => {
  settingStore.setLanguage(command)
  setI18nLanguage(command)
}
</script>

<style scoped>
.select-lang {
  font-size: 18px;
}

.select-lang__icon {
  margin-right: 8px;
}

.active {
  color: var(--gvray-color-primary);
}
</style>
