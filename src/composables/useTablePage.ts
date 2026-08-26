import { ref, onMounted } from 'vue'
import { useSettingStore } from '@/stores'
import { logger } from '@/utils'

interface UseTablePageOptions {
  /** 是否在 onMounted 时立即请求，默认 true */
  immediate?: boolean
}

export function useTablePage<T = any>(
  requestFn: (params: Record<string, any>) => Promise<any>,
  options: UseTablePageOptions = {},
) {
  const { immediate = true } = options
  const settingStore = useSettingStore()

  const loading = ref(false)
  const list = ref<T[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(settingStore.pageSize || 10)

  // 缓存最近一次搜索参数，供 reload / 翻页复用
  let lastParams: Record<string, any> = {}

  const fetchList = async (params?: Record<string, any>) => {
    if (params !== undefined) lastParams = params
    loading.value = true
    try {
      const res = await requestFn({
        ...lastParams,
        page: page.value,
        pageSize: pageSize.value,
      })
      if (res?.data) {
        list.value = res.data.items ?? res.data ?? []
        total.value = res.data.total ?? 0
      }
    } catch (error) {
      logger.error(error)
      list.value = []
    } finally {
      loading.value = false
    }
  }

  /** 用同一批参数重新加载当前页 */
  const reload = () => fetchList()

  /** 搜索：重置到第一页再请求 */
  const handleSearch = (params: Record<string, any> = {}) => {
    page.value = 1
    fetchList(params)
  }

  /** 重置：清空参数，回到第一页 */
  const handleReset = () => {
    page.value = 1
    fetchList({})
  }

  /** 切换页码 */
  const handlePageChange = (p: number) => {
    page.value = p
    fetchList()
  }

  /** 切换每页条数（同步到全局设置） */
  const handleSizeChange = (size: number) => {
    settingStore.setPageSize(size)
    pageSize.value = size
    page.value = 1
    fetchList()
  }

  if (immediate) {
    onMounted(() => fetchList())
  }

  return {
    loading,
    list,
    total,
    page,
    pageSize,
    fetchList,
    reload,
    handleSearch,
    handleReset,
    handlePageChange,
    handleSizeChange,
  }
}
