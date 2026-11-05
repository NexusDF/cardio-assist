<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import OfflineNotice from '@/shared/components/OfflineNotice.vue'
import { useAppI18n } from '@/shared/i18n'
import { offlineReadyStorageKey, shouldShowOfflineReady } from '@/shared/offline'
import TabBar from '@/shared/components/TabBar.vue'

const { t } = useAppI18n()
const route = useRoute()
const showTabs = computed(() => route.meta.hideTabs !== true)
const { offlineReady } = useRegisterSW({ immediate: true })
const dismissed = ref(readDismissed())
const online = ref(navigator.onLine)
const showReady = computed(() => shouldShowOfflineReady(offlineReady.value, dismissed.value))

function readDismissed(): string | null {
  try {
    return localStorage.getItem(offlineReadyStorageKey)
  } catch {
    return null
  }
}

function dismissReady() {
  dismissed.value = '1'
  try {
    localStorage.setItem(offlineReadyStorageKey, '1')
  } catch {
    // The notice stays hidden for this visit even if storage is blocked.
  }
}

function setOnline() {
  online.value = true
}

function setOffline() {
  online.value = false
}

function focusContent() {
  document.getElementById('content')?.focus()
}

onMounted(() => {
  window.addEventListener('online', setOnline)
  window.addEventListener('offline', setOffline)
})

onUnmounted(() => {
  window.removeEventListener('online', setOnline)
  window.removeEventListener('offline', setOffline)
})
</script>

<template>
  <a class="skip-link" href="#content" @click.prevent="focusContent">
    {{ t('nav.skip') }}
  </a>
  <OfflineNotice :ready="showReady" :online="online" @dismiss="dismissReady" />
  <RouterView />
  <TabBar v-if="showTabs" />
</template>
