import type { App } from 'vue'
import { hasPermi } from './hasPermi'
import { hasRole } from './hasRole'

export function setupPermissionDirectives(app: App) {
  app.directive('hasPermi', hasPermi)
  app.directive('hasRole', hasRole)
}

export { hasPermi, hasRole }
