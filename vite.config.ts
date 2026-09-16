import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import createVitePlugins from './vite/plugins'

// 默认值是「未在 .env.* 中设置时的回退」的单一来源；
// 其 JS 类型同时决定环境变量的强制转换方式（number / boolean / string）。
const APP_DEFAULTS = {
  APP_ENV: '',
  APP_API_URL: '',
  APP_API_ORIGIN: '',
  APP_API_TOKEN_KEY: '',
  APP_API_TIMEOUT: 10000,
  APP_CDN_URL: '',
  APP_VERSION: '',
  APP_BUILD_TIME: '',
  APP_SENTRY_DSN: '',
  APP_TRACKING_ID: '',
  APP_MOCK_ENABLED: false,
  APP_LOGGING_ENABLED: false,
  APP_DEFAULT_LANGUAGE: 'zh-CN',
  APP_DEFAULT_AVATAR_URL: '',
  APP_AES_KEY: '',
  APP_AES_IV: '',
} as const

// 把 .env.{mode} 中 APP_ 开头的变量注入为 __APP_*__ 全局变量，与 React 项目保持一致
function buildAppDefines(mode: string) {
  const env = loadEnv(mode, process.cwd(), '')
  const defines: Record<string, string | number | boolean> = {}
  for (const [key, fallback] of Object.entries(APP_DEFAULTS)) {
    const globalKey = `__APP_${key.replace(/^APP_/, '')}__`
    const raw = env[key]

    if (typeof fallback === 'number') {
      defines[globalKey] = Number(raw ?? fallback)
    } else if (typeof fallback === 'boolean') {
      // 未显式设置时按环境推断：非 prod 默认开启便于调试，prod 默认关闭避免生产日志噪声
      if (key === 'APP_LOGGING_ENABLED' && raw === undefined) {
        defines[globalKey] = env.APP_ENV !== 'prod'
      } else {
        defines[globalKey] = raw === 'true'
      }
    } else {
      defines[globalKey] = JSON.stringify(raw ?? fallback)
    }
  }
  return defines
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isBuild = command === 'build'

  const viteEnv = loadEnv(mode, process.cwd())
  const { VITE_APP_ENV } = viteEnv

  return {
    base: VITE_APP_ENV === 'production' ? '/' : '/',
    define: buildAppDefines(mode),
    plugins: createVitePlugins(viteEnv, isBuild),
    server: {
      port: 9527,
      host: true,
      open: true,
      proxy: {
        // https://cn.vitejs.dev/config/#server-proxy
        '/dev-api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/dev-api/, ''),
        },
      },
    },
    resolve: {
      // https://cn.vitejs.dev/config/#resolve-alias
      alias: {
        // 设置路径
        '~': path.resolve(__dirname, './'),
        // 设置别名
        '@': path.resolve(__dirname, './src'),
      },
      // https://cn.vitejs.dev/config/#resolve-extensions
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: !isBuild,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isBuild,
          drop_debugger: isBuild,
        },
        format: {
          comments: false,
        },
      },
      chunkSizeWarningLimit: 1500,
      cssCodeSplit: true,
      rollupOptions: {
        external: [],
        output: {
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]',
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (
                id.includes('@ant-design/icons-vue') ||
                id.includes('@element-plus/icons-vue') ||
                id.includes('lucide-vue-next')
              )
                return 'chunk-icons'
              if (id.includes('vue')) return 'vue-vendor'
              if (id.includes('axios')) return 'axios-vendor'
              if (id.includes('element-plus')) return 'element-plus-vendor'
              if (id.includes('dayjs')) return 'dayjs-vendor'
              return 'vendor'
            }
          },
        },
      },
    },
    // warning: "@charset" must be the first rule in the file
    css: {
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove()
                }
              },
            },
          },
        ],
      },
    },
  }
})
