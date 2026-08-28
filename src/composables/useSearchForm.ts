import { reactive, ref } from 'vue'

interface UseSearchFormOptions {
  /** 日期范围起始字段名，默认 createdAtStart */
  dateStartKey?: string
  /** 日期范围结束字段名，默认 createdAtEnd */
  dateEndKey?: string
}

/**
 * 通用搜索表单：聚合搜索参数与日期范围，配合 useTablePage 的 handleSearch/handleReset 提供搜索与重置。
 */
export function useSearchForm<TParams extends Record<string, any>>(
  initialParams: TParams,
  handleSearch: (params: Record<string, any>) => void,
  handleReset: () => void,
  options: UseSearchFormOptions = {},
) {
  const { dateStartKey = 'createdAtStart', dateEndKey = 'createdAtEnd' } =
    options

  const searchExpanded = ref(false)
  const searchParams = reactive<TParams>({ ...initialParams })
  const dateRange = ref<[string, string] | null>(null)

  const buildParams = (): Record<string, any> => {
    const params = Object.fromEntries(
      Object.entries(searchParams).filter(
        ([, value]) => value !== undefined && value !== null && value !== '',
      ),
    )
    if (dateRange.value?.[0]) params[dateStartKey] = dateRange.value[0]
    if (dateRange.value?.[1]) params[dateEndKey] = dateRange.value[1]
    return params
  }

  const onSearch = () => handleSearch(buildParams())

  const onReset = () => {
    Object.assign(searchParams, { ...initialParams })
    dateRange.value = null
    handleReset()
  }

  return {
    searchExpanded,
    searchParams,
    dateRange,
    buildParams,
    onSearch,
    onReset,
  }
}
