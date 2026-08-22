import { createWebHistory, createRouter } from 'vue-router'
import Layout from '@/layout'

// 公共路由
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login'),
    hidden: true,
    meta: {
      auth: false,
    },
  },
  {
    path: '/register',
    component: () => import('@/views/register'),
    hidden: true,
    meta: {
      auth: false,
    },
  },
  {
    path: '/',
    component: Layout,
    redirect: '/',
    children: [
      {
        path: '/',
        component: () => import('@/views/dashboard'),
        name: 'Dashboard',
        meta: {
          title: '仪表板',
          permissions: [],
        },
      },
      {
        path: '/profile',
        component: () => import('@/views/profile'),
        name: 'Profile',
        meta: {
          title: '个人资料',
          permissions: [],
        },
      },
      {
        path: '/docs',
        component: () => import('@/views/docs'),
        name: 'Docs',
        meta: {
          title: '文档',
          permissions: [],
        },
      },
      {
        path: '/403',
        component: () => import('@/views/error/403'),
        name: '403',
      },
      {
        path: '/404',
        component: () => import('@/views/error/404'),
        name: '404',
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]

// 动态路由，基于用户权限动态加载
// TODO: 当前为硬编码配置，后续改为从后端菜单数据（queryMenus 接口）动态转换生成，
//       转换逻辑统一放在 router/utils.ts 的 buildRoutesFromMenus() 函数中。
export const dynamicRoutes = [
  {
    path: '/system',
    component: Layout,
    children: [
      {
        path: '/system/user',
        component: () => import('@/views/system/user'),
        name: 'SystemUser',
        meta: {
          title: '用户管理',
          permissions: ['system:user:list'],
        },
      },
      {
        path: '/system/role',
        component: () => import('@/views/system/role'),
        name: 'SystemRole',
        meta: {
          title: '角色管理',
          permissions: ['system:role:list'],
        },
      },
      {
        path: '/system/permission',
        component: () => import('@/views/system/permission'),
        name: 'SystemPermission',
        meta: {
          title: '权限管理',
          permissions: ['system:permission:list'],
        },
      },
      {
        path: '/system/menu',
        component: () => import('@/views/system/menu'),
        name: 'SystemMenu',
        meta: {
          title: '菜单管理',
          permissions: ['system:menu:list'],
        },
      },
      {
        path: '/system/department',
        component: () => import('@/views/system/department'),
        name: 'SystemDepartment',
        meta: {
          title: '部门管理',
          permissions: ['system:department:list'],
        },
      },
      {
        path: '/system/position',
        component: () => import('@/views/system/position'),
        name: 'SystemPosition',
        meta: {
          title: '职位管理',
          permissions: ['system:position:list'],
        },
      },
      {
        path: '/system/dictionary',
        component: () => import('@/views/system/dictionary'),
        name: 'SystemDictionary',
        meta: {
          title: '字典管理',
          permissions: ['system:dictionary:list'],
        },
      },
      {
        path: '/system/dictionary/items/:typeId',
        component: () => import('@/views/system/dictionary/items'),
        name: 'SystemDictionaryItems',
        meta: {
          title: '字典项管理',
          permissions: ['system:dictionary:list'],
        },
      },
      {
        path: '/system/config',
        component: () => import('@/views/system/config'),
        name: 'SystemConfig',
        meta: {
          title: '系统配置',
          permissions: ['system:config:list'],
        },
      },
      {
        path: '/system/notice',
        component: () => import('@/views/system/notice'),
        name: 'SystemNotice',
        meta: {
          title: '通知公告',
          permissions: ['system:notice:list'],
        },
      },
      {
        path: '/system/log',
        name: 'SystemLog',
        meta: {
          title: '日志管理',
        },
        children: [
          {
            path: '/system/log/login',
            component: () => import('@/views/system/log/login'),
            name: 'SystemLogLogin',
            meta: {
              title: '登录日志',
              permissions: ['system:log-login:list'],
            },
          },
          {
            path: '/system/log/operation',
            component: () => import('@/views/system/log/operation'),
            name: 'SystemLogOperation',
            meta: {
              title: '操作日志',
              permissions: ['system:log-operation:list'],
            },
          },
        ],
      },
      {
        path: '/system/user-auth/role/:userId',
        component: () => import('@/views/system/user/auth-role'),
        name: 'SystemUserAuthRole',
        meta: {
          title: '用户分配角色',
          permissions: ['system:user:update-roles'],
        },
      },
      {
        path: '/system/role-auth/permission/:roleId',
        component: () => import('@/views/system/role/auth-permission'),
        name: 'SystemRoleAuthPermission',
        meta: {
          title: '角色分配权限',
          permissions: ['system:role:update-permissions'],
        },
      },
      {
        path: '/system/role-auth/user/:roleId',
        component: () => import('@/views/system/role/auth-user'),
        name: 'SystemRoleAuthUser',
        meta: {
          title: '角色分配用户',
          permissions: ['system:role:update-users'],
        },
      },
    ],
  },
  {
    path: '/monitor',
    component: Layout,
    children: [
      {
        path: '/monitor/server',
        component: () => import('@/views/monitor/server'),
        name: 'MonitorServer',
        meta: {
          title: '服务监控',
          permissions: ['monitor:server:list'],
        },
      },
      {
        path: '/monitor/online-user',
        component: () => import('@/views/monitor/online-user'),
        name: 'MonitorOnlineUser',
        meta: {
          title: '在线用户',
          permissions: ['monitor:online-user:list'],
        },
      },
      {
        path: '/monitor/cache',
        component: () => import('@/views/monitor/cache-monitor'),
        name: 'MonitorCache',
        meta: {
          title: '缓存监控',
          permissions: ['monitor:cache:list'],
        },
      },
    ],
  },
]

// 路由
const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    return { top: 0 }
  },
})

export default router
