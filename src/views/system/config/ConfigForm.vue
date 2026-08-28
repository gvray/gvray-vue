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
          <el-col :span="12">
            <el-form-item label="配置名称" prop="name">
              <el-input
                v-model="formData.name"
                placeholder="请输入配置名称"
                :maxlength="100"
                :disabled="formLoading"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="配置键" prop="key">
              <el-input
                v-model="formData.key"
                placeholder="如 siteName"
                :disabled="isEdit || formLoading"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="配置类型" prop="type">
              <el-select
                v-model="formData.type"
                placeholder="请选择"
                :disabled="isEdit || formLoading"
                style="width: 100%"
              >
                <el-option
                  v-for="item in dict.config_type"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="配置分组" prop="group">
              <el-select
                v-model="formData.group"
                placeholder="请选择"
                :disabled="formLoading"
                style="width: 100%"
              >
                <el-option
                  v-for="item in dict.config_group"
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
            <el-form-item label="前端公开" prop="isPublic">
              <el-switch
                v-model="formData.isPublic"
                active-text="公开"
                inactive-text="私有"
                :disabled="formLoading"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="配置值" prop="value">
              <el-input-number
                v-if="formData.type === 'number'"
                v-model="formData.value"
                :controls="false"
                placeholder="请输入数字"
                :disabled="formLoading"
                style="width: 100%"
              />
              <el-select
                v-else-if="formData.type === 'boolean'"
                v-model="formData.value"
                placeholder="请选择布尔值"
                :disabled="formLoading"
                style="width: 100%"
              >
                <el-option label="true" value="true" />
                <el-option label="false" value="false" />
              </el-select>
              <el-input
                v-else-if="formData.type === 'json'"
                v-model="formData.value"
                type="textarea"
                :rows="6"
                :maxlength="2000"
                show-word-limit
                placeholder='请输入 JSON，如 {"key":"value"}'
                style="font-family: monospace"
                :disabled="formLoading"
              />
              <el-input
                v-else
                v-model="formData.value"
                :maxlength="1000"
                placeholder="请输入配置值"
                :disabled="formLoading"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="配置描述" prop="description">
              <el-input
                v-model="formData.description"
                type="textarea"
                :rows="2"
                :maxlength="200"
                show-word-limit
                placeholder="请输入配置描述"
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
import { createConfig, getConfigById, updateConfig } from '@/api/config'
import { logger } from '@/utils'

interface Props {
  dict: Record<string, API.DictionaryItemResponseDto[]>
  onOk?: () => void
}

const props = defineProps<Props>()

const formRef = ref<FormInstance>()
const visible = ref(false)
const title = ref('添加配置')
const formLoading = ref(false)
const submitLoading = ref(false)
const editingId = ref<string | undefined>()

const isEdit = computed(() => !!editingId.value)

const defaultFormData = () => ({
  name: '',
  key: '',
  type: 'string',
  group: '',
  sort: 0,
  status: 'enabled' as string,
  isPublic: false,
  value: '' as any,
  description: '',
})

const formData = reactive(defaultFormData())

const rules = {
  name: [
    { required: true, message: '请输入配置名称', trigger: 'blur' },
    { max: 100, message: '不能超过100个字符', trigger: 'blur' },
  ],
  key: [
    { required: true, message: '请输入配置键', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z][a-zA-Z0-9_-]*$/,
      message: '以字母开头，仅含字母、数字、下划线、横线',
      trigger: 'blur',
    },
    { max: 50, message: '不能超过50个字符', trigger: 'blur' },
  ],
  type: [{ required: true, message: '请选择配置类型', trigger: 'change' }],
  group: [{ required: true, message: '请选择配置分组', trigger: 'change' }],
  sort: [{ required: true, message: '请输入排序权重', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  value: [
    { required: true, message: '请输入配置值', trigger: 'blur' },
    {
      validator: (_r: any, v: any, cb: (e?: Error) => void) => {
        if (formData.type === 'json' && v) {
          try {
            JSON.parse(String(v))
            cb()
          } catch {
            cb(new Error('JSON 格式不合法'))
          }
        } else {
          cb()
        }
      },
      trigger: 'blur',
    },
  ],
  description: [{ max: 200, message: '不能超过200个字符', trigger: 'blur' }],
}

const loadData = async () => {
  if (!editingId.value) {
    Object.assign(formData, defaultFormData())
    return
  }
  formLoading.value = true
  try {
    const { data } = await getConfigById(editingId.value)
    if (data) {
      let parsedValue: any = data.value
      if (data.type === 'number') {
        const n = Number(data.value)
        parsedValue = Number.isNaN(n) ? undefined : n
      }
      const shortKey =
        data.group && data.key?.startsWith(`${data.group}.`)
          ? data.key.slice(data.group.length + 1)
          : data.key
      Object.assign(formData, {
        name: data.name || '',
        key: shortKey || '',
        type: data.type || 'string',
        group: data.group || '',
        sort: data.sort ?? 0,
        status: data.status as string,
        isPublic: !!data.isPublic,
        value: parsedValue,
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
    const payload: any = {
      name: formData.name,
      key: `${formData.group}.${formData.key}`,
      type: formData.type,
      group: formData.group,
      sort: formData.sort,
      status: formData.status,
      isPublic: formData.isPublic,
      value: formData.value,
      description: formData.description || undefined,
    }
    if (formData.type === 'number') {
      payload.value =
        formData.value === undefined || formData.value === null
          ? ''
          : String(formData.value)
    }
    if (formData.type === 'json' && typeof formData.value === 'string') {
      try {
        payload.value = JSON.stringify(JSON.parse(formData.value))
      } catch (error) {
        logger.debug('JSON validation error:', error)
      }
    }
    if (!isEdit.value) {
      await createConfig(payload as API.CreateConfigDto)
      ElMessage.success('新增成功')
    } else {
      await updateConfig(editingId.value!, payload as API.UpdateConfigDto)
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
  show: (dialogTitle: string, configId?: string) => {
    title.value = dialogTitle
    editingId.value = configId
    visible.value = true
  },
})
</script>
