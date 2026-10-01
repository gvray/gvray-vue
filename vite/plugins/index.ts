import vue from '@vitejs/plugin-vue'
import createSvgIcon from './svg-icon'
import createAutoImport from './auto-import'
import createComponents from './components'
import createMockServer from './mock'
import createSetupExtend from './setup-extend'
import createCompression from './compression'
import createVisualizer from './visualizer'

export interface ViteEnv {
  VITE_PORT?: number
  VITE_USE_MOCK?: boolean
  VITE_USE_PWA?: boolean
  VITE_PUBLIC_PATH?: string
  VITE_PROXY?: [string, string][]
  VITE_GLOB_APP_TITLE?: string
  VITE_GLOB_APP_SHORT_NAME?: string
  VITE_USE_CDN?: boolean
  VITE_DROP_CONSOLE?: boolean
  VITE_BUILD_COMPRESS?: 'gzip' | 'brotli' | 'none'
  VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE?: boolean
  VITE_LEGACY?: boolean
  VITE_USE_IMAGEMIN?: boolean
  VITE_GENERATE_UI?: string
  [key: string]: any
}

// 类型适配器：处理 Vite 7.x 和插件之间的类型兼容性问题
type VitePlugin = any

export default function createVitePlugins(
  viteEnv: ViteEnv,
  isBuild = false,
  mode = '',
): VitePlugin[] {
  const vitePlugins: VitePlugin[] = [vue()]

  // 添加 AutoImport 插件
  vitePlugins.push(createAutoImport())

  // 添加 SvgIcon 插件
  vitePlugins.push(createSvgIcon(isBuild))

  // 添加 Components 插件
  vitePlugins.push(createComponents())

  // 添加 Mock 服务插件
  vitePlugins.push(createMockServer())

  // 添加 Setup 插件
  vitePlugins.push(createSetupExtend())

  if (isBuild) {
    vitePlugins.push(...createCompression(viteEnv))
  }

  if (isBuild && mode === 'analyze') {
    vitePlugins.push(createVisualizer())
  }

  return vitePlugins
}
