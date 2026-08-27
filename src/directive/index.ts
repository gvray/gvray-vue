import type { App } from 'vue'
import { hasPermi, hasRole } from './permission'

export default {
  install(app: App) {
    app.directive('hasPermi', hasPermi)
    app.directive('hasRole', hasRole)
  },
}
