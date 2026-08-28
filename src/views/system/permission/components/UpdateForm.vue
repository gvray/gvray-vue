<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="520px"
    :close-on-click-modal="false"
    destroy-on-close
    @closed="resetForm"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="90px"
      label-position="right"
    >
      <el-form-item label="权限名称">
        <span class="permission-form__readonly">
          {{ record?.name || '-' }}
        </span>
      </el-form-item>
      <el-form-item label="权限代码">
        <code class="permission-form__code">{{ record?.code || '-' }}</code>
      </el-form-item>
      <el-form-item label="权限描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="4"
          show-word-limit
          :maxlength="200"
          placeholder="请输入权限描述"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
        确认
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { updatePermission } from '@/api/permission'
import { logger } from '@/utils'

interface Props {
  onOk?: () => void
}
const props = defineProps<Props>()

const formRef = ref<FormInstance>()
const visible = ref(false)
const title = ref('修改权限描述')
const submitLoading = ref(false)
const record = ref<API.PermissionResponseDto | null>(null)

const formData = reactive({ description: '' })

const rules = {
  description: [{ max: 200, message: '描述最多 200 字', trigger: 'blur' }],
}

const resetForm = () => {
  formRef.value?.resetFields()
  formData.description = ''
  record.value = null
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  if (!record.value?.permissionId) return

  submitLoading.value = true
  try {
    await updatePermission(record.value.permissionId, {
      description: formData.description,
    })
    ElMessage.success('修改成功')
    visible.value = false
    props.onOk?.()
  } catch (error) {
    logger.error(error)
  } finally {
    submitLoading.value = false
  }
}

const handleCancel = () => {
  visible.value = false
}

defineExpose({
  show: (dialogTitle: string, data: API.PermissionResponseDto) => {
    title.value = dialogTitle
    record.value = data
    formData.description = data.description || ''
    visible.value = true
  },
})
</script>

<style lang="scss" scoped>
.permission-form {
  &__readonly {
    color: var(--gvray-color-text-secondary, var(--el-text-color-secondary));
    font-weight: 500;
  }

  &__code {
    font-family: 'SF Mono', Monaco, monospace;
    color: var(--gvray-color-text-secondary, var(--el-text-color-secondary));
    background: var(--gvray-color-fill-quaternary, var(--el-fill-color-light));
    padding: 2px 6px;
    border-radius: 4px;
  }
}
</style>
