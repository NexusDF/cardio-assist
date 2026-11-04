import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'
import '@fontsource/inter/cyrillic-500.css'
import '@fontsource/inter/cyrillic-600.css'
import '@fontsource/inter/cyrillic-700.css'
import '@fontsource/inter/cyrillic-800.css'
import App from './App.vue'
import './style.css'

const app = createApp(App)

app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  },
})

app.mount('#app')
