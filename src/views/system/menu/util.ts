import {
  normalizeVirtualRoot,
  VIRTUAL_ROOT_ID,
  withVirtualRoot as withVirtualRootGeneric,
  type VirtualRootConfig,
} from '@gvray/adminkit'

export const MENU_VIRTUAL_ROOT_CONFIG: VirtualRootConfig = {
  idField: 'menuId',
  idValue: VIRTUAL_ROOT_ID,
  nameField: 'name',
  nameValue: '顶级菜单（无上级）',
  parentIdField: 'parentMenuId',
}

export const withVirtualRoot = <T extends Record<string, any>>(
  data: T[],
): T[] => {
  return withVirtualRootGeneric(data, MENU_VIRTUAL_ROOT_CONFIG)
}

export const normalizeToBackend = <T extends Record<string, any>>(
  values: T,
): T => {
  return normalizeVirtualRoot(
    values,
    VIRTUAL_ROOT_ID,
    MENU_VIRTUAL_ROOT_CONFIG.parentIdField as string,
  )
}
