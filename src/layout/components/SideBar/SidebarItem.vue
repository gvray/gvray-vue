<template>
  <template v-if="!item.hidden">
    <template v-if="item.path === '' && hasChildren(item)">
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :base-path="resolvePath(child.path)"
      />
    </template>

    <template v-else-if="!hasChildren(item)">
      <el-menu-item :index="resolvePath(item.path)">
        <el-icon v-if="item.icon">
          <Icon :name="item.icon" />
        </el-icon>
        <template #title>
          <span class="menu-title">{{ menuTitle }}</span>
        </template>
      </el-menu-item>
    </template>

    <el-sub-menu v-else :index="resolvePath(item.path)">
      <template #title>
        <el-icon v-if="item.icon">
          <Icon :name="item.icon" />
        </el-icon>
        <span class="menu-title">{{ menuTitle }}</span>
      </template>

      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :base-path="resolvePath(item.path)"
      />
    </el-sub-menu>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface MenuItem {
  path: string
  name?: string
  code?: string
  icon?: string
  hidden?: boolean
  noShowingChildren?: boolean
  children?: MenuItem[]
  meta?: {
    title?: string
  }
}

const props = defineProps<{
  item: MenuItem
  basePath?: string
}>()

const { t, te } = useI18n()

const menuTitle = computed(() => {
  const { item } = props
  // 优先使用 i18n key（code），不存在则回退到 name 或 meta.title
  if (item.code && te(item.code)) {
    return t(item.code)
  }
  return item.name || item.meta?.title || ''
})

const hasChildren = (item: MenuItem) => {
  return item.children && item.children.length > 0 && !item.noShowingChildren
}

const isAbsolutePath = (path: string) => {
  return path.startsWith('/') || path.startsWith('http')
}

const resolvePath = (routePath: string) => {
  if (isAbsolutePath(routePath)) {
    return routePath
  }
  const base = props.basePath || ''
  return base
    ? `${base.replace(/\/$/, '')}/${routePath.replace(/^\//, '')}`
    : routePath
}
</script>

<style scoped lang="scss">
.menu-title {
  margin-left: 8px;
}

// antd/lucide 图标放在 el-icon 里时，让其撑满容器
:deep(.el-icon) {
  font-size: 16px;
  width: 1em;
  height: 1em;
  flex-shrink: 0;

  svg,
  .anticon,
  .anticon svg {
    width: 1em;
    height: 1em;
    font-size: inherit;
    display: block;
  }
}
</style>
