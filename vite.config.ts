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
  // 空前缀加载 APP_*（含 CI 注入的 APP_BASE_PATH），用于子路径部署（如 GitHub Pages）
  const baseEnv = loadEnv(mode, process.cwd(), '')

  return {
    // 子路径部署通过 APP_BASE_PATH 注入 base；默认 / 兼容根路径部署（Docker）
    base: baseEnv.APP_BASE_PATH || '/',
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
            if (!id.includes('node_modules')) return
            // pnpm 把依赖放在 .pnpm/<pkg>@<ver>_vue@<ver>_/node_modules/<pkg>/...
            // 直接 id.includes('vue') 会命中路径里的 vue@x.x.x，把 element-plus 等带
            // vue peer 的包误判进 vue-vendor，与 chunk-icons 形成循环依赖，
            // 生产环境触发 TDZ（Cannot access 'x' before initialization，白屏）。
            // 取最后一段 node_modules/ 之后的真实包名来判断。
            const seg = id.split('node_modules/').pop() ?? ''
            const [scope, name] = seg.split('/')
            const pkg = scope.startsWith('@') ? `${scope}/${name ?? ''}` : scope

            if (
              pkg === '@ant-design/icons-vue' ||
              pkg === '@element-plus/icons-vue' ||
              pkg === 'lucide-vue-next'
            )
              return 'chunk-icons'
            if (
              pkg === 'vue' ||
              pkg.startsWith('@vue/') ||
              pkg === 'vue-demi' ||
              pkg === 'vue-router' ||
              pkg === 'vue-i18n' ||
              pkg.startsWith('@vueuse/')
            )
              return 'vue-vendor'
            if (pkg === 'axios') return 'axios-vendor'
            if (pkg === 'element-plus' || pkg.startsWith('@element-plus/'))
              return 'element-plus-vendor'
            if (pkg === 'dayjs') return 'dayjs-vendor'
            return 'vendor'
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
