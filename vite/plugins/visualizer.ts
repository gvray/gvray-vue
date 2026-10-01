import { visualizer } from 'rollup-plugin-visualizer'

export default function createVisualizer() {
  return visualizer({
    open: true,
    filename: 'dist/bundle.html',
    gzipSize: true,
    brotliSize: true,
    sourcemap: false,
    template: 'treemap',
    title: 'Bundle',
    projectRoot: process.cwd(),
  })
}
