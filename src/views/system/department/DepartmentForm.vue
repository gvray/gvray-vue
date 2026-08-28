<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="820px"
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
            <el-form-item label="上级部门" prop="parentId">
              <el-tree-select
                v-model="formData.parentId"
                :data="departmentTree"
                :props="{
                  value: 'departmentId',
                  label: 'name',
                  children: 'children',
                }"
                :render-after-expand="false"
                check-strictly
                clearable
                placeholder="请选择上级部门"
                :disabled="formLoading"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门名称" prop="name">
              <el-input
                v-model="formData.name"
                placeholder="请输入部门名称"
                :disabled="formLoading"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number
                v-model="formData.sort"
                :min="0"
                controls-position="right"
                placeholder="请输入排序"
                :disabled="formLoading"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="manager">
              <el-input
                v-model="formData.manager"
                placeholder="请输入负责人"
                :disabled="formLoading"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input
                v-model="formData.phone"
                placeholder="请输入联系电话"
                :disabled="formLoading"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="formData.email"
                placeholder="请输入邮箱"
                :disabled="formLoading"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门状态" prop="status">
              <el-radio-group v-model="formData.status" :disabled="formLoading">
                <el-radio
                  v-for="item in dict.common_status"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="部门描述" prop="description">
              <el-input
                v-model="formData.description"
                type="textarea"
                placeholder="请输入部门描述"
                :rows="3"
                show-word-limit
                :maxlength="200"
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
  createDepartment,
  getDepartmentById,
  queryDepartmentOptions,
  updateDepartment,
} from '@/api/department'
import { logger } from '@/utils'
import {
  buildDepartmentTree,
  normalizeToBackend,
  VIRTUAL_ROOT_ID,
} from './util'

interface Props {
  dict: Record<string, API.DictionaryItemResponseDto[]>
  onOk?: () => void
}

const props = defineProps<Props>()

const formRef = ref<FormInstance>()
const visible = ref(false)
const title = ref('添加部门')
const formLoading = ref(false)
const submitLoading = ref(false)
const editingId = ref<string | undefined>()

const departmentList = ref<API.DepartmentResponseDto[]>([])
const departmentTree = computed(() =>
  buildDepartmentTree(departmentList.value, editingId.value),
)

const isEdit = computed(() => !!editingId.value)

const defaultFormData = () => ({
  parentId: VIRTUAL_ROOT_ID as string,
  name: '',
  manager: '',
  phone: '',
  email: '',
  status: 'enabled' as string,
  sort: 0,
  description: '',
})

const formData = reactive(defaultFormData())

const rules = {
  parentId: [{ required: true, message: '请选择上级部门', trigger: 'change' }],
  name: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }],
  sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '部门状态不能为空', trigger: 'change' }],
  phone: [
    {
      validator: (_: unknown, phone: string, callback: (e?: Error) => void) => {
        if (!phone || /^1[3-9][0-9]\d{8}$/.test(phone)) {
          callback()
        } else {
          callback(new Error('请输入正确的手机号码'))
        }
      },
      trigger: 'blur',
    },
  ],
  email: [
    {
      type: 'email' as const,
      message: '请输入正确的邮箱格式',
      trigger: 'blur',
    },
  ],
}

const loadData = async () => {
  formLoading.value = true
  try {
    const [optionsRes, detailRes] = await Promise.all([
      queryDepartmentOptions(),
      editingId.value ? getDepartmentById(editingId.value) : undefined,
    ])

    if (optionsRes.data) departmentList.value = optionsRes.data

    if (detailRes?.data) {
      Object.assign(formData, {
        parentId: detailRes.data.parentId ?? VIRTUAL_ROOT_ID,
        name: detailRes.data.name || '',
        manager: detailRes.data.manager || '',
        phone: detailRes.data.phone || '',
        email: detailRes.data.email || '',
        status: detailRes.data.status as string,
        sort: detailRes.data.sort ?? 0,
        description: detailRes.data.description || '',
      })
    } else {
      Object.assign(formData, defaultFormData())
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
  departmentList.value = []
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    const values = normalizeToBackend({ ...formData })
    if (!isEdit.value) {
      await createDepartment(values as API.CreateDepartmentDto)
      ElMessage.success('新增成功')
    } else {
      await updateDepartment(
        editingId.value!,
        values as API.UpdateDepartmentDto,
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
  show: (dialogTitle: string, departmentId?: string) => {
    title.value = dialogTitle
    editingId.value = departmentId
    visible.value = true
  },
})
</script>
