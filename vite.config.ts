import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import createVitePlugins from './vite/plugins'

// 把 .env.{mode} 中 APP_ 开头的变量注入为 __APP_*__ 全局变量，与 React 项目保持一致
function buildAppDefines(mode: string) {
  const env = loadEnv(mode, process.cwd(), '')
  const defines: Record<string, string> = {}
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith('APP_')) {
      const globalKey = `__APP_${key.replace(/^APP_/, '')}__`
      defines[globalKey] = JSON.stringify(value)
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
