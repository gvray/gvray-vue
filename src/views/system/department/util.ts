import {
  VIRTUAL_ROOT_ID,
  withVirtualRoot as withVirtualRootGeneric,
  normalizeVirtualRoot,
  type VirtualRootConfig,
} from '@gvray/adminkit'

/** 部门模块的虚拟根节点配置 */
export const DEPARTMENT_VIRTUAL_ROOT_CONFIG: VirtualRootConfig = {
  idField: 'departmentId',
  idValue: VIRTUAL_ROOT_ID,
  nameField: 'name',
  nameValue: '顶级部门（无上级）',
  parentIdField: 'parentId',
}

/**
 * 将扁平部门选项数据构建为嵌套树（含虚拟根），并排除指定 id 的节点。
 * 供 el-tree-select 的 :data 使用。
 */
export function buildDepartmentTree(
  data: API.DepartmentResponseDto[],
  excludeId?: string,
): API.DepartmentResponseDto[] {
  const filtered = excludeId
    ? data.filter((item) => item.departmentId !== excludeId)
    : data
  // withVirtualRoot 返回扁平数据：虚拟根 + 真实节点（顶级 parentId 指向虚拟根）
  const flat = withVirtualRootGeneric(filtered, DEPARTMENT_VIRTUAL_ROOT_CONFIG)

  const map = new Map<string, any>()
  const roots: any[] = []
  flat.forEach((item: any) => {
    map.set(item.departmentId, { ...item, children: [] })
  })
  flat.forEach((item: any) => {
    const node = map.get(item.departmentId)
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId).children.push(node)
    } else {
      roots.push(node)
    }
  })
  // 清理空 children 数组
  const prune = (nodes: any[]) => {
    nodes.forEach((n) => {
      if (Array.isArray(n.children) && n.children.length === 0) {
        delete n.children
      } else if (Array.isArray(n.children)) {
        prune(n.children)
      }
    })
  }
  prune(roots)
  return roots as unknown as API.DepartmentResponseDto[]
}

/** 将表单数据中的虚拟根节点转换为 null（提交到后端） */
export function normalizeToBackend<T extends Record<string, any>>(
  values: T,
): T {
  return normalizeVirtualRoot(values, VIRTUAL_ROOT_ID, 'parentId') as T
}

export { VIRTUAL_ROOT_ID }
