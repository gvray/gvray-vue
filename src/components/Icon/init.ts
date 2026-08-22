/**
 * 图标方案说明（Vue 版与 React 版的差异）
 *
 * 1. iconfont Symbol（gvray- 前缀）
 *    由 headScripts 自动加载 /iconfont/iconfont.js 注入 SVG sprite，此处无需初始化。
 *
 * 2. 本地 SVG（local- 前缀，存放于 src/assets/icons/svg/）
 *    由 vite-plugin-svg-icons 在构建时扫描并生成 sprite sheet，
 *    运行时通过 main.ts 中的 `import 'virtual:svg-icons-register'` 注入，
 *    symbol id 格式为 icon-[dir]-[name]（见 vite/plugins/svg-icon.ts）。
 *    React 版不使用 Vite 构建，故无此方案。
 */
