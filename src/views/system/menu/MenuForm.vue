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
          <el-form-item prop="menuId" class="hidden">
            <el-input v-model="formData.menuId" />
          </el-form-item>
          <el-col :span="24">
            <el-form-item label="上级目录" prop="parentMenuId">
              <el-tree-select
                v-model="formData.parentMenuId"
                :data="parentOptions"
                :props="treeProps"
                node-key="menuId"
                default-expand-all
                check-strictly
                filterable
                :disabled="formLoading"
                placeholder="请选择上级目录"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="nameLabel" prop="name">
              <el-input
                v-model="formData.name"
                :placeholder="`请输入${nameLabel}`"
                :disabled="formLoading"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型" prop="type">
              <el-segmented
                v-model="formData.type"
                :options="typeOptions"
                :disabled="isEdit || formLoading"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="国际化键" prop="code">
              <el-input
                v-model="formData.code"
                placeholder="如 menu.system.user"
                :disabled="formLoading"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="pathLabel" prop="path">
              <el-input
                v-model="formData.path"
                :placeholder="`请输入${pathLabel}，如 /system/user`"
                :disabled="formLoading"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单图标" prop="icon">
              <IconPicker v-model="formData.icon" placement="bottom-start" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序权重" prop="sort">
              <el-input-number
                v-model="formData.sort"
                :min="0"
                controls-position="right"
                placeholder="请输入排序权重"
                :disabled="formLoading"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col v-if="formData.type !== 'CATALOG'" :span="12">
            <el-form-item label="权限代码" prop="permissionCode">
              <el-input
                v-model="formData.permissionCode"
                placeholder="请输入绑定的权限代码"
                :disabled="formLoading"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
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
          <el-col :span="12">
            <el-form-item label="是否隐藏" prop="hidden">
              <el-switch
                v-model="formData.hidden"
                active-text="是"
                inactive-text="否"
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
  createMenu,
  getMenuById,
  queryMenuOptions,
  updateMenu,
} from '@/api/menu'
import IconPicker from '@/components/Icon/IconPicker/index.vue'
import { logger } from '@/utils'
import { VIRTUAL_ROOT_ID } from '@gvray/adminkit'
import { normalizeToBackend, withVirtualRoot } from './util'

interface Props {
  dict: Record<string, API.DictionaryItemResponseDto[]>
  onOk?: () => void
}
const props = defineProps<Props>()

const formRef = ref<FormInstance>()
const visible = ref(false)
const title = ref('添加菜单')
const formLoading = ref(false)
const submitLoading = ref(false)
const editingId = ref<string | undefined>()
const parentOptions = ref<API.MenuTreeNodeDto[]>([])

const isEdit = computed(() => !!editingId.value)

const treeProps = {
  value: 'menuId',
  label: 'name',
  children: 'children',
}

const typeOptions = [
  { label: '目录', value: 'CATALOG' },
  { label: '菜单', value: 'MENU' },
]

const defaultFormData = () => ({
  menuId: '',
  parentMenuId: VIRTUAL_ROOT_ID as string,
  name: '',
  type: 'CATALOG' as 'CATALOG' | 'MENU',
  code: '',
  path: '',
  icon: '',
  sort: 0,
  permissionCode: '',
  status: 'enabled' as string,
  hidden: false,
})

const formData = reactive(defaultFormData())

const nameLabel = computed(() =>
  formData.type === 'CATALOG' ? '目录名称' : '菜单名称',
)
const pathLabel = computed(() =>
  formData.type === 'CATALOG' ? '目录路径' : '菜单路径',
)

const rules = computed(() => ({
  parentMenuId: [
    { required: true, message: '请选择上级目录', trigger: 'change' },
  ],
  name: [
    { required: true, message: `${nameLabel.value}不能为空`, trigger: 'blur' },
  ],
  type: [{ required: true, message: '类型不能为空', trigger: 'change' }],
  path: [
    { required: true, message: `${pathLabel.value}不能为空`, trigger: 'blur' },
  ],
  sort: [{ required: true, message: '排序权重不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
}))

const loadData = async () => {
  formLoading.value = true
  try {
    const optionsPromise = queryMenuOptions()
    const detailPromise = editingId.value
      ? getMenuById(editingId.value)
      : undefined
    const [optionsRes, detailRes] = await Promise.all([
      optionsPromise,
      detailPromise,
    ])

    if (optionsRes.data) {
      parentOptions.value = withVirtualRoot(
        optionsRes.data.filter((item) => item.type !== 'MENU'),
      )
    }

    if (detailRes?.data) {
      const data = detailRes.data
      Object.assign(formData, {
        menuId: data.menuId,
        parentMenuId: data.parentMenuId ?? VIRTUAL_ROOT_ID,
        name: data.name,
        type: data.type,
        code: data.code || '',
        path: data.path || '',
        icon: data.icon || '',
        sort: data.sort ?? 0,
        permissionCode: data.permissionCode || '',
        status: data.status,
        hidden: data.hidden,
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
  parentOptions.value = []
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    const { menuId: _menuId, ...rest } = normalizeToBackend({
      ...formData,
    })
    void _menuId

    if (!isEdit.value) {
      await createMenu(rest as API.CreateMenuDto)
      ElMessage.success('新增成功')
    } else {
      await updateMenu(editingId.value!, rest as API.UpdateMenuDto)
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
  show: (dialogTitle: string, menuId?: string) => {
    title.value = dialogTitle
    editingId.value = menuId
    visible.value = true
  },
})
</script>

<style lang="scss" scoped>
.hidden {
  display: none;
}
</style>
