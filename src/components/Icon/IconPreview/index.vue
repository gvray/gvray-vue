<template>
  <div class="icon-preview">
    <div class="icon-preview__tabs">
      <div class="icon-preview__tab-bar">
        <div
          v-for="group in groups"
          :key="group.type"
          class="icon-preview__tab"
          :class="{ 'is-active': activeType === group.type }"
          @click="activeType = group.type"
        >
          {{ tabLabel[group.type] ?? group.type.toUpperCase() }}
        </div>
        <el-input
          v-model="search"
          class="icon-preview__search"
          placeholder="搜索图标"
          clearable
          :prefix-icon="SearchIcon"
          style="width: 160px"
        />
      </div>
      <div class="icon-preview__grid">
        <div
          v-for="name in filteredIcons"
          :key="name"
          class="icon-preview__item"
          :class="{ 'is-active': name === selected }"
          :title="name"
          @click="onPick(name)"
        >
          <Icon :name="name" :size="16" />
        </div>
        <div v-if="!filteredIcons.length" class="icon-preview__empty">
          无匹配图标
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Search as SearchIcon } from '@element-plus/icons-vue'
import Icon from '../index.vue'
import { iconMap, type IconConfig, type IconKey } from '../map'

interface Props {
  selected?: string
}
const props = defineProps<Props>()
const emit = defineEmits<{ change: [icon: IconKey] }>()

const search = ref('')

const tabLabel: Record<string, string> = {
  'antd': 'ANTD',
  'element': 'ELEMENT',
  'lucide': 'LUCIDE',
  'svg': 'SVG',
  'sprite-iconfont': '雪碧图(在线)',
  'sprite-local': '雪碧图(本地)',
}

const groupKeyOf = (cfg: IconConfig): string => {
  if (cfg.type === 'sprite') {
    return cfg.symbol.startsWith('gvray-') ? 'sprite-iconfont' : 'sprite-local'
  }
  return cfg.type
}

const groups = computed(() => {
  const result: Record<string, IconKey[]> = {}
  ;(Object.keys(iconMap) as IconKey[]).forEach((key) => {
    const cfg = iconMap[key]
    const label = groupKeyOf(cfg)
    if (!result[label]) result[label] = []
    result[label].push(key)
  })
  return Object.entries(result)
    .map(([type, names]) => ({ type, names }))
    .sort((a, b) => b.names.length - a.names.length)
})

const activeType = ref(groups.value[0]?.type ?? '')

const filteredIcons = computed(() => {
  const group = groups.value.find((g) => g.type === activeType.value)
  if (!group) return []
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return group.names
  return group.names.filter((n) =>
    (n as string).toLowerCase().includes(keyword),
  )
})

const onPick = (name: IconKey) => emit('change', name)
</script>

<style lang="scss" scoped>
.icon-preview {
  width: 740px;
  max-height: 500px;
  padding: 0 10px;
  box-sizing: border-box;

  &__tab-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 6px 12px;
    flex-wrap: wrap;
  }

  &__tab {
    padding: 4px 12px;
    font-size: 13px;
    border-radius: 4px;
    cursor: pointer;
    color: var(--el-text-color-secondary);
    transition: all 0.2s;

    &:hover {
      background-color: var(--el-fill-color);
    }

    &.is-active {
      color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }
  }

  &__search {
    margin-left: auto;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(30px, 1fr));
    gap: 4px;
    max-height: 360px;
    overflow-y: auto;
    padding: 0 4px 12px;
    align-content: start;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1 / 1;
    color: var(--el-text-color-secondary);
    background-color: var(--el-fill-color);
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--el-fill-color-dark);
    }

    &.is-active {
      color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }
  }

  &__empty {
    grid-column: 1 / -1;
    text-align: center;
    color: var(--el-text-color-secondary);
    padding: 40px 0;
  }
}
</style>
