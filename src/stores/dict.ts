import { ref } from 'vue'
import { defineStore } from 'pinia'

type DictMap = Record<string, API.DictionaryItemResponseDto[]>

export const useDictStore = defineStore('dict', () => {
  const cache = ref<DictMap>({})
  const loading = ref<string[]>([])

  const setDict = (code: string, items: API.DictionaryItemResponseDto[]) => {
    cache.value[code] = items
    loading.value = loading.value.filter((c) => c !== code)
  }

  const getDict = (code: string) => cache.value[code]

  const isLoading = (code: string) => loading.value.includes(code)

  const markLoading = (code: string) => {
    if (!loading.value.includes(code)) {
      loading.value.push(code)
    }
  }

  return { cache, loading, setDict, getDict, isLoading, markLoading }
})
