import { defineStore } from 'pinia'

type DictMap = Record<string, API.DictionaryItemResponseDto[]>

interface DictState {
  cache: DictMap
  loading: string[]
  setDict: (code: string, items: API.DictionaryItemResponseDto[]) => void
  getDict: (code: string) => API.DictionaryItemResponseDto[] | undefined
  isLoading: (code: string) => boolean
  markLoading: (code: string) => void
}

export const useDictStore = defineStore('dict', {
  state: (): DictState => ({
    cache: {},
    loading: [],
  }),

  actions: {
    setDict(code, items) {
      this.cache[code] = items
      this.loading = this.loading.filter((c) => c !== code)
    },

    getDict(code) {
      return this.cache[code]
    },

    isLoading(code) {
      return this.loading.includes(code)
    },

    markLoading(code) {
      if (!this.loading.includes(code)) {
        this.loading.push(code)
      }
    },
  },
})
