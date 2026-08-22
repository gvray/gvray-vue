<template>
  <Charts :options="options" :height="height" />
</template>

<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { useChartToken } from '@/composables/useChartToken'

interface Props {
  data: { date: string; value: number }[]
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 340,
})

const { token } = useChartToken()

const options = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: token.value.colorBgContainer,
    borderColor: token.value.colorBorder,
    borderWidth: 1,
    textStyle: { color: token.value.colorText, fontSize: 13 },
    axisPointer: {
      type: 'shadow',
      shadowStyle: { color: 'rgba(102, 126, 234, 0.06)' },
    },
    formatter: (params: any) => {
      const list = Array.isArray(params) ? params : [params]
      if (list.length === 0) return ''
      const item = list[0]
      return `<div style="font-weight:600;margin-bottom:4px">${item.name}</div>
              <div style="color:#667eea">登录次数: <b>${item.value}</b></div>`
    },
  },
  grid: {
    left: 8,
    right: 16,
    bottom: 0,
    top: 16,
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: props.data.map((item) => item.date),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: token.value.colorTextSecondary,
      fontSize: 11,
      margin: 12,
    },
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: token.value.colorTextSecondary, fontSize: 11 },
    splitLine: {
      lineStyle: { color: token.value.colorFillSecondary, type: 'dashed' },
    },
  },
  series: [
    {
      name: '登录次数',
      data: props.data.map((item) => item.value),
      type: 'line',
      smooth: true,
      showSymbol: false,
      emphasis: {
        focus: 'series',
        itemStyle: {
          borderColor: '#667eea',
          borderWidth: 3,
          shadowBlur: 8,
          shadowColor: 'rgba(102, 126, 234, 0.4)',
        },
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(102, 126, 234, 0.25)' },
            { offset: 0.7, color: 'rgba(102, 126, 234, 0.05)' },
            { offset: 1, color: 'rgba(102, 126, 234, 0)' },
          ],
        },
      },
      lineStyle: {
        width: 2.5,
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' },
          ],
        },
      },
      itemStyle: {
        color: '#667eea',
        borderColor: token.value.colorBgContainer,
        borderWidth: 2,
      },
      symbolSize: 8,
    },
  ],
}))
</script>
