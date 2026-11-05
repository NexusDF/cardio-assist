/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    hideTabs?: boolean
  }
}
