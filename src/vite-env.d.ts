/// <reference types="vite/client" />
/// <reference types="node" />

declare const __APP_ENV__: string
declare const __APP_API_URL__: string
declare const __APP_API_TOKEN_KEY__: string
declare const __APP_API_TIMEOUT__: number
declare const __APP_VERSION__: string
declare const __APP_BUILD_TIME__: string
declare const __APP_CDN_URL__: string
declare const __APP_SENTRY_DSN__: string
declare const __APP_TRACKING_ID__: string
declare const __APP_MOCK_ENABLED__: boolean
declare const __APP_DEFAULT_LANGUAGE__: string
declare const __APP_DEFAULT_AVATAR_URL__: string

declare module '*.vue' {
  import { type DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@/*' {
  import { type DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'virtual:svg-icons-register' {}
