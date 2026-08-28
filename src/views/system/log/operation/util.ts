/** HTTP 方法对应的 el-tag 类型 */
const METHOD_TAG_TYPE: Record<string, string> = {
  GET: 'success',
  POST: 'primary',
  PUT: 'warning',
  DELETE: 'danger',
}

export const methodTagType = (method: string): string =>
  METHOD_TAG_TYPE[method] || 'info'
