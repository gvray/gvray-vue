import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

const store = createPinia()

store.use(
  createPersistedState({
    key: (id) => `gvray-${id}`,
  }),
)

export { useAuthStore } from './auth'
export { useDictStore } from './dict'
export { useSettingStore } from './setting'

export default store
