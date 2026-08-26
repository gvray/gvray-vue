<template>
  <div class="table-pro">
    <div v-if="$slots.search" class="table-pro__search">
      <slot name="search" />
    </div>
    <div v-if="$slots.toolbar" class="table-pro__toolbar">
      <slot name="toolbar" />
    </div>
    <div class="table-pro__table">
      <slot />
    </div>
    <div class="table-pro__spacer" />
    <div class="table-pro__pagination">
      <el-pagination
        :current-page="page"
        :page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @update:current-page="onPageChange"
        @update:page-size="onSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  page?: number
  pageSize?: number
  total?: number
}

withDefaults(defineProps<Props>(), {
  page: 1,
  pageSize: 10,
  total: 0,
})

const emit = defineEmits<{
  'update:page': [page: number]
  'update:page-size': [pageSize: number]
  'pageChange': [page: number]
  'sizeChange': [pageSize: number]
}>()

const onPageChange = (val: number) => {
  emit('update:page', val)
  emit('pageChange', val)
}

const onSizeChange = (val: number) => {
  emit('update:page-size', val)
  emit('sizeChange', val)
}
</script>

<style lang="scss" scoped>
.table-pro {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;

  &__search {
    flex-shrink: 0;

    :deep(.el-row) {
      row-gap: 16px;
    }

    :deep(.el-form-item) {
      margin-bottom: 0;
    }
  }

  &__toolbar {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
    margin-top: 16px;
    margin-bottom: 12px;
  }

  &__table {
    flex-shrink: 0;
  }

  &__spacer {
    flex: 1;
  }

  &__pagination {
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
    padding-top: 16px;
  }
}
</style>
