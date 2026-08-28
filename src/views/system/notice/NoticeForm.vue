<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="720px"
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
            <el-form-item label="标题" prop="title">
              <el-input
                v-model="formData.title"
                :maxlength="200"
                show-word-limit
                placeholder="请输入标题"
                :disabled="formLoading"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型" prop="type">
              <el-select
                v-model="formData.type"
                placeholder="请选择"
                :disabled="formLoading"
                style="width: 100%"
              >
                <el-option
                  v-for="item in noticeTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
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
                  v-for="item in statusOptions"
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
                :max="999"
                controls-position="right"
                placeholder="请输入"
                :disabled="formLoading"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="内容" prop="content">
              <el-input
                v-model="formData.content"
                type="textarea"
                :rows="6"
                :maxlength="2000"
                show-word-limit
                placeholder="请输入内容"
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
import { createNotice, getNoticeById, updateNotice } from '@/api/notice'
import { logger } from '@/utils'

interface Props {
  onOk?: () => void
}

const props = defineProps<Props>()

const noticeTypeOptions = [
  { label: '通知', value: 'notice' },
  { label: '通告', value: 'announcement' },
]
const statusOptions = [
  { label: '启用', value: 'enabled' },
  { label: '禁用', value: 'disabled' },
]

const formRef = ref<FormInstance>()
const visible = ref(false)
const title = ref('添加通知公告')
const formLoading = ref(false)
const submitLoading = ref(false)
const editingId = ref<string | undefined>()

const isEdit = computed(() => !!editingId.value)

const defaultFormData = () => ({
  title: '',
  type: 'notice',
  status: 'enabled' as string,
  sort: 0,
  content: '',
})

const formData = reactive(defaultFormData())

const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { max: 200, message: '不能超过200个字符', trigger: 'blur' },
  ],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  sort: [{ required: true, message: '请输入排序权重', trigger: 'blur' }],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' },
    { max: 2000, message: '不能超过2000个字符', trigger: 'blur' },
  ],
}

const loadData = async () => {
  if (!editingId.value) {
    Object.assign(formData, defaultFormData())
    return
  }
  formLoading.value = true
  try {
    const { data } = await getNoticeById(editingId.value)
    if (data) {
      Object.assign(formData, {
        title: data.title || '',
        type: data.type || 'notice',
        status: data.status as string,
        sort: data.sort ?? 0,
        content: data.content || '',
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
      title: formData.title,
      type: formData.type as any,
      status: formData.status as any,
      sort: formData.sort,
      content: formData.content,
    }
    if (!isEdit.value) {
      await createNotice(payload as API.CreateNoticeDto)
      ElMessage.success('新增成功')
    } else {
      await updateNotice(editingId.value!, payload as API.UpdateNoticeDto)
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
  show: (dialogTitle: string, noticeId?: string) => {
    title.value = dialogTitle
    editingId.value = noticeId
    visible.value = true
  },
})
</script>
