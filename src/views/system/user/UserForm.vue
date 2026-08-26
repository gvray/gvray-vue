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
          <el-col :span="12">
            <el-form-item label="用户名称" prop="nickname">
              <el-input
                v-model="formData.nickname"
                placeholder="请输入用户名称"
                :disabled="formLoading"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phone">
              <el-input
                v-model="formData.phone"
                placeholder="请输入手机号码"
                :maxlength="11"
                :disabled="formLoading"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="formData.email"
                placeholder="请输入邮箱"
                :maxlength="50"
                :disabled="formLoading"
              />
            </el-form-item>
          </el-col>
          <el-col v-if="!isEdit" :span="12">
            <el-form-item label="登陆账号" prop="username">
              <el-input
                v-model="formData.username"
                placeholder="请输入登陆账号"
                :maxlength="30"
                :disabled="formLoading"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select
                v-model="formData.gender"
                placeholder="请选择性别"
                clearable
                :disabled="formLoading"
                style="width: 100%"
              >
                <el-option
                  v-for="item in dict.user_gender"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门" prop="departmentId">
              <el-tree-select
                v-model="formData.departmentId"
                :data="departmentList"
                :props="{
                  value: 'departmentId',
                  label: 'name',
                  children: 'children',
                }"
                clearable
                :render-after-expand="false"
                placeholder="请选择部门"
                :disabled="formLoading"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位" prop="positionIds">
              <el-select
                v-model="formData.positionIds"
                placeholder="请选择岗位"
                multiple
                clearable
                :disabled="formLoading"
                style="width: 100%"
              >
                <el-option
                  v-for="item in positionList"
                  :key="item.positionId"
                  :label="item.name"
                  :value="item.positionId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="!isEdit" :span="12">
            <el-form-item label="用户密码" prop="password">
              <el-input
                v-model="formData.password"
                type="password"
                placeholder="请输入用户密码"
                :maxlength="20"
                show-password
                :disabled="formLoading"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户状态" prop="status">
              <el-radio-group v-model="formData.status" :disabled="formLoading">
                <el-radio
                  v-for="item in dict.user_status"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="用户描述" prop="description">
              <el-input
                v-model="formData.description"
                type="textarea"
                placeholder="请输入用户描述"
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
import { queryDepartmentTree } from '@/api/department'
import { queryPositionOptions } from '@/api/position'
import { createUser, getUserById, updateUser } from '@/api/user'
import { logger } from '@/utils'

interface Props {
  dict: Record<string, API.DictionaryItemResponseDto[]>
  onOk?: () => void
}

const props = defineProps<Props>()

const formRef = ref<FormInstance>()
const visible = ref(false)
const title = ref('添加用户')
const formLoading = ref(false)
const submitLoading = ref(false)
const editingId = ref<string | undefined>()

const departmentList = ref<API.DepartmentResponseDto[]>([])
const positionList = ref<API.PositionResponseDto[]>([])

const isEdit = computed(() => !!editingId.value)

const defaultFormData = () => ({
  nickname: '',
  phone: '',
  email: '',
  username: '',
  gender: undefined as string | undefined,
  departmentId: undefined as string | undefined,
  positionIds: [] as string[],
  password: '123456',
  status: 'enabled' as string,
  description: '',
})

const formData = reactive(defaultFormData())

const rules = {
  nickname: [{ required: true, message: '用户名称不能为空', trigger: 'blur' }],
  username: [
    { required: true, message: '登陆账号不能为空', trigger: 'blur' },
    {
      min: 2,
      max: 20,
      message: '登陆账号长度必须介于 2 和 20 之间',
      trigger: 'blur',
    },
  ],
  password: [
    { required: true, message: '用户密码不能为空', trigger: 'blur' },
    {
      min: 5,
      max: 20,
      message: '用户密码长度必须介于 5 和 20 之间',
      trigger: 'blur',
    },
  ],
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
      message: '请输入正确的邮箱地址',
      trigger: 'blur',
    },
  ],
}

const loadData = async () => {
  formLoading.value = true
  try {
    const [deptRes, posRes] = await Promise.all([
      queryDepartmentTree(),
      queryPositionOptions(),
    ])

    if (deptRes.data) departmentList.value = deptRes.data as any
    if (posRes.data) positionList.value = posRes.data

    if (editingId.value) {
      const { data } = await getUserById(editingId.value)
      if (data) {
        Object.assign(formData, {
          nickname: data.nickname || '',
          phone: data.phone || '',
          email: data.email || '',
          username: data.username || '',
          gender: data.gender,
          departmentId: data.department?.departmentId,
          positionIds: data.positions?.map((p) => p.positionId) || [],
          status: data.status,
          description: data.description || '',
        })
      }
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
  positionList.value = []
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    if (!isEdit.value) {
      await createUser({
        nickname: formData.nickname,
        username: formData.username,
        password: formData.password,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        gender: formData.gender as any,
        departmentId: formData.departmentId,
        positionIds: formData.positionIds,
        status: formData.status as any,
        description: formData.description || undefined,
      })
      ElMessage.success('新增成功')
    } else {
      await updateUser({
        userId: editingId.value!,
        nickname: formData.nickname,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        gender: formData.gender as any,
        departmentId: formData.departmentId,
        positionIds: formData.positionIds,
        status: formData.status as any,
        description: formData.description || undefined,
      })
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
  show: (dialogTitle: string, userId?: string) => {
    title.value = dialogTitle
    editingId.value = userId
    visible.value = true
  },
})
</script>
