<template>
  <span style="vertical-align: -0.125em">
    <svg
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      :width="size"
      :height="size"
    >
      <circle cx="512" cy="213" r="106" :fill="color" />
      <circle cx="512" cy="512" r="106" :fill="color" />
      <circle cx="512" cy="811" r="106" :fill="color" />
    </svg>
  </span>
</template>

<script setup lang="ts">
interface Props {
  size?: number
  color?: string
}

withDefaults(defineProps<Props>(), {
  size: 16,
  color: 'currentColor',
})
</script>
