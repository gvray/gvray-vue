<template>
  <Charts :options="options" :height="height" />
</template>

<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { useChartToken } from '@/composables/useChartToken'

interface RoleDataItem {
  name: string
  value: number
  itemStyle?: { color: string }
}

interface Props {
  data: RoleDataItem[] | Record<string, unknown> | null
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 340,
})

const { token } = useChartToken()

const colorPalette = [
  '#667eea',
  '#f5576c',
  '#4facfe',
  '#43e97b',
  '#fa709a',
  '#764ba2',
  '#f093fb',
  '#38f9d7',
]

const normalizedData = computed<RoleDataItem[]>(() => {
  if (!props.data) return []
  if (Array.isArray(props.data)) return props.data as RoleDataItem[]
  return []
})

const dataWithColor = computed(() =>
  normalizedData.value.map((item, index) => ({
    ...item,
    itemStyle: {
      color:
        item.itemStyle?.color ||
        colorPalette[index % colorPalette.length] ||
        token.value.colorBorder,
    },
  })),
)

const options = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: token.value.colorBgContainer,
    borderColor: token.value.colorBorder,
    borderWidth: 1,
    textStyle: { color: token.value.colorText, fontSize: 13 },
    formatter: (params: any) => {
      const p = params as {
        name: string
        value: number
        percent: number
        color: string
      }
      return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
                <b>${p.name}</b>
              </div>
              <div>用户数: <b>${p.value}</b> (${p.percent}%)</div>`
    },
  },
  legend: {
    orient: 'vertical',
    right: 16,
    top: 'center',
    itemWidth: 10,
    itemHeight: 10,
    itemGap: 14,
    icon: 'circle',
    textStyle: {
      fontSize: 12,
      color: token.value.colorTextSecondary,
      rich: {
        name: {
          fontSize: 12,
          color: token.value.colorText,
          padding: [0, 0, 0, 4],
        },
        value: {
          fontSize: 12,
          color: token.value.colorTextSecondary,
          padding: [0, 0, 0, 8],
        },
      },
    },
    formatter: (name: string) => {
      const item = dataWithColor.value.find((d) => d.name === name)
      return `{name|${name}}  {value|${item?.value ?? 0}}`
    },
  },
  series: [
    {
      name: '角色分布',
      type: 'pie',
      radius: ['48%', '72%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
        borderColor: token.value.colorBgContainer,
        borderWidth: 3,
      },
      label: { show: false },
      labelLine: { show: false },
      emphasis: {
        scale: true,
        scaleSize: 6,
        itemStyle: {
          shadowBlur: 16,
          shadowOffsetX: 0,
        },
      },
      data: dataWithColor.value,
    },
  ],
}))
</script>
