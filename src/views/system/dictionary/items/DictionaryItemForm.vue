<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="560px"
    :close-on-click-modal="false"
    destroy-on-close
    @closed="resetForm"
  >
    <div v-loading="formLoading">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="90px"
        label-position="right"
      >
        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="字典类型" prop="typeCode">
              <el-input v-model="formData.typeCode" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="字典项值" prop="value">
              <el-input
                v-model="formData.value"
                placeholder="请输入字典项值"
                :disabled="formLoading"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="显示标签" prop="label">
              <el-input
                v-model="formData.label"
                placeholder="请输入显示标签"
                :disabled="formLoading"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select
                v-model="formData.status"
                placeholder="请选择"
                :disabled="formLoading"
                style="width: 100%"
              >
                <el-option
                  v-for="item in dict.common_status"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序权重" prop="sort">
              <el-input-number
                v-model="formData.sort"
                :min="0"
                :max="9999"
                controls-position="right"
                placeholder="请输入"
                :disabled="formLoading"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="字典项描述" prop="description">
              <el-input
                v-model="formData.description"
                type="textarea"
                :rows="3"
                placeholder="请输入字典项描述"
                :disabled="formLoading"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit"
        >确认</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import {
  createDictionaryItem,
  getDictionaryItemById,
  updateDictionaryItem,
} from '@/api/dictionary'
import { logger } from '@/utils'

interface Props {
  typeCode?: string
  dict: Record<string, API.DictionaryItemResponseDto[]>
  onOk?: () => void
}

const props = defineProps<Props>()

const formRef = ref<FormInstance>()
const visible = ref(false)
const title = ref('添加字典项')
const formLoading = ref(false)
const submitLoading = ref(false)
const editingId = ref<string | undefined>()

const isEdit = computed(() => !!editingId.value)

const defaultFormData = () => ({
  typeCode: props.typeCode || '',
  value: '',
  label: '',
  status: 'enabled' as string,
  sort: 0,
  description: '',
})

const formData = reactive(defaultFormData())

const rules = {
  value: [{ required: true, message: '请输入字典项值', trigger: 'blur' }],
  label: [{ required: true, message: '请输入显示标签', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

const loadData = async () => {
  if (!editingId.value) {
    Object.assign(formData, defaultFormData())
    return
  }
  formLoading.value = true
  try {
    const { data } = await getDictionaryItemById(editingId.value)
    if (data) {
      Object.assign(formData, {
        typeCode: data.typeCode || props.typeCode || '',
        value: data.value || '',
        label: data.label || '',
        status: data.status as string,
        sort: data.sort ?? 0,
        description: data.description || '',
      })
    }
  } catch (error) {
    logger.error(error)
    ElMessage.error('数据加载失败')
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, defaultFormData())
  editingId.value = undefined
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    const payload = {
      typeCode: formData.typeCode,
      value: formData.value,
      label: formData.label,
      status: formData.status as any,
      sort: formData.sort,
      description: formData.description || undefined,
    }
    if (!isEdit.value) {
      await createDictionaryItem(payload as API.CreateDictionaryItemDto)
      ElMessage.success('新增成功')
    } else {
      await updateDictionaryItem(
        editingId.value!,
        payload as API.UpdateDictionaryItemDto,
      )
      ElMessage.success('修改成功')
    }
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

watch(visible, (val) => {
  if (val) loadData()
})

defineExpose({
  show: (dialogTitle: string, itemId?: string) => {
    title.value = dialogTitle
    editingId.value = itemId
    visible.value = true
  },
})
</script>
