<template>
  <div class="page-skeleton">
    <el-skeleton :rows="rows" animated />
  </div>
</template>

<script setup lang="ts">
interface Props {
  rows?: number
}

withDefaults(defineProps<Props>(), { rows: 8 })
</script>

<style lang="scss" scoped>
.page-skeleton {
  width: 100%;
}
</style>
