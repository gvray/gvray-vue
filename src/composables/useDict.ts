import { reactive, onMounted } from 'vue'
import { getDictionaryItemsByTypeCodes } from '@/api/dictionary'
import { useDictStore } from '@/stores/dict'

export function useDict(
  codes: string[],
): Record<string, API.DictionaryItemResponseDto[]> {
  const dictStore = useDictStore()
  const dict = reactive<Record<string, API.DictionaryItemResponseDto[]>>(
    Object.fromEntries(codes.map((c) => [c, dictStore.getDict(c) || []])),
  )

  onMounted(async () => {
    const missing = codes.filter((c) => !dictStore.getDict(c))
    if (missing.length === 0) return

    try {
      const res = await getDictionaryItemsByTypeCodes({
        typeCodes: missing.join(','),
      })
      if (res?.data) {
        for (const [code, items] of Object.entries(res.data)) {
          dictStore.setDict(code, items)
          dict[code] = items
        }
      }
    } catch {
      // silent
    }
  })

  return dict
}
