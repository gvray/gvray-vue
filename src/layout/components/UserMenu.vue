<template>
  <el-dropdown @command="handleMenuClick">
    <div class="navbar-action-item user-menu">
      <el-avatar :size="32" :src="avatarSrc" :style="avatarStyle">
        {{ avatarText }}
      </el-avatar>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="profile" :icon="User">
          {{ $t('menu.profile') }}
        </el-dropdown-item>
        <el-dropdown-item command="logout" :icon="SwitchButton" divided>
          {{ $t('pages.login.logout') }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, SwitchButton } from '@element-plus/icons-vue'
import { useAuthStore, useSettingStore } from '@/stores'
import { runtimeConfig } from '@/utils/runtime-config'
import { logout } from '@/api/auth'
import { tokenManager } from '@/utils/token'
import { resetDynamicRoutes } from '@/router/utils'

const router = useRouter()
const authStore = useAuthStore()
const settingStore = useSettingStore()

const profile = computed(() => authStore.profile)
const userProfile = computed(() => (profile.value as any)?.profile)

const avatarSrc = computed(() => {
  return (
    userProfile.value?.avatar ||
    runtimeConfig.get().user.defaultAvatar ||
    undefined
  )
})

const avatarText = computed(() => {
  const text = (userProfile.value?.nickname?.trim() ||
    profile.value?.username)?.[0]
  return text || '?'
})

const avatarStyle = computed(() => ({
  'marginLeft': '6px',
  '--el-avatar-bg-color': avatarSrc.value
    ? 'transparent'
    : settingStore.colorPrimary,
}))

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    try {
      const res = await logout()
      ElMessage.success(res.message)
    } catch {
      // 即使接口失败也继续清理本地状态
    }
    tokenManager.clearTokens()
    authStore.clearAuth()
    resetDynamicRoutes()
    router.push('/login')
  } catch {
    // 用户取消
  }
}

const handleMenuClick = async (command: string) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    await handleLogout()
  }
}
</script>

<style scoped>
.user-menu {
  cursor: pointer;
  display: flex;
  align-items: center;
}
</style>
