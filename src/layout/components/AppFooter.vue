<template>
  <footer v-if="visible && (text || copyright || icp)" class="app-footer">
    <span v-if="text">{{ text }}</span>
    <span v-if="text && (copyright || icp)">|</span>
    <span v-if="copyright">{{ copyright }}</span>
    <span v-if="copyright && icp">|</span>
    <span v-if="icp">{{ icp }}</span>
  </footer>
</template>

<script setup lang="ts">
interface Props {
  visible?: boolean
  text?: string
  copyright?: string
  icp?: string
}

withDefaults(defineProps<Props>(), {
  visible: false,
  text: undefined,
  copyright: undefined,
  icp: undefined,
})
</script>

<style scoped>
.app-footer {
  margin-bottom: 20px;
  padding: 0;
  color: var(--gvray-color-text-secondary, #8c8c8c);
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}
</style>
