<template>
  <el-breadcrumb class="breadcrumb" separator="/">
    <el-breadcrumb-item :to="{ path: '/' }">
      <el-icon><House /></el-icon>
    </el-breadcrumb-item>
    <el-breadcrumb-item v-for="item in crumbs" :key="item.path" :to="item.to">
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, type RouteRecordRaw } from 'vue-router'
import { House } from '@element-plus/icons-vue'
import { constantRoutes, dynamicRoutes } from '@/router'

interface BreadcrumbItem {
  path: string
  title: string
  to?: string
}

const route = useRoute()
const allRoutes: RouteRecordRaw[] = [...constantRoutes, ...dynamicRoutes]

function buildCrumbs(
  pathname: string,
  routes: RouteRecordRaw[],
): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = []

  const walk = (
    list: RouteRecordRaw[],
    segments: BreadcrumbItem[],
  ): boolean => {
    for (const r of list) {
      if (!r.path) continue

      // 跳过通配符路由与重定向占位路由
      if (r.path.includes('*')) continue
      if (r.redirect && !r.component && !r.children?.length) continue

      // 动态参数匹配
      const pattern = r.path.replace(/:[^/]+/g, '[^/]+')
      const regex = new RegExp(`^${pattern}$`)
      const isExact = regex.test(pathname)
      const isPrefix = pathname.startsWith(
        r.path.replace(/:[^/]+/g, '').replace(/\/$/, ''),
      )

      if (!isExact && !isPrefix) continue

      const title = r.meta?.title as string | undefined
      if (title) {
        segments.push({
          path: r.path,
          title,
          // 非末级且存在 component（即可渲染页面）时才允许点击跳转
          to:
            !isExact && r.component
              ? r.path.replace(/:[^/]+/g, () => '')
              : undefined,
        })
      }

      if (isExact) {
        crumbs.push(...segments)
        return true
      }

      if (r.children?.length && walk(r.children, segments)) {
        return true
      }

      // 回溯
      if (title) {
        segments.pop()
      }
    }
    return false
  }

  walk(routes, [])
  return crumbs
}

const crumbs = computed<BreadcrumbItem[]>(() =>
  buildCrumbs(route.path, allRoutes),
)
</script>

<style lang="scss" scoped>
.breadcrumb {
  font-size: 14px;

  :deep(.el-breadcrumb__inner) {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}
</style>
