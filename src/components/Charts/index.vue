<template>
  <div ref="chartRef" class="charts-wrapper" :style="wrapperStyle" />
</template>

<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { BarChart, GaugeChart, LineChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

// 按需注册项目中实际使用的图表类型与组件，避免全量引入 echarts
// 目前使用到的 series：line / bar / pie / gauge
// 目前使用到的组件：title / tooltip / grid / legend
// 如需新增图表类型，请在这里补充注册

echarts.use([
  BarChart,
  GaugeChart,
  LineChart,
  PieChart,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
])

interface Props {
  options: EChartsOption
  height?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  height: undefined,
})

const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

const wrapperStyle = computed(() => {
  if (!props.height) return {}
  return {
    height:
      typeof props.height === 'number' ? `${props.height}px` : props.height,
  }
})

function initChart() {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption(props.options)
}

function setChartOption() {
  chartInstance?.setOption(props.options, true)
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  initChart()
  if (chartRef.value) {
    resizeObserver = new ResizeObserver(() => {
      chartInstance?.resize()
    })
    resizeObserver.observe(chartRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  chartInstance?.dispose()
  chartInstance = null
})

watch(
  () => props.options,
  () => {
    if (chartInstance) {
      setChartOption()
    } else {
      initChart()
    }
  },
  { deep: true },
)
</script>

<style scoped>
.charts-wrapper {
  width: 100%;
  height: 100%;
}
</style>
