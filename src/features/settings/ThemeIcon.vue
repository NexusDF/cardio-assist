<script setup lang="ts">
import type { ThemePreference } from '@/shared/theme'

defineProps<{
  theme: ThemePreference
}>()
</script>

<template>
  <svg
    v-if="theme === 'light'"
    viewBox="0 0 24 24"
    class="size-6 shrink-0"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="12" cy="12" r="3.4" fill="none" stroke="currentColor" stroke-width="1.8" />
    <path
      d="M12 3.2v2.1M12 18.7v2.1M3.2 12h2.1M18.7 12h2.1M5.8 5.8l1.5 1.5M16.7 16.7l1.5 1.5M18.2 5.8l-1.5 1.5M7.3 16.7l-1.5 1.5"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
    />
  </svg>
  <svg
    v-else-if="theme === 'dark'"
    viewBox="0 0 24 24"
    class="size-6 shrink-0"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M15.2 14.6A6 6 0 0 1 9.4 5.6 6.2 6.2 0 1 0 15.2 14.6Z"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linejoin="round"
    />
  </svg>
  <svg v-else viewBox="0 0 24 24" class="size-6 shrink-0" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="7.2" fill="none" stroke="currentColor" stroke-width="1.8" />
    <path d="M12 4.8a7.2 7.2 0 0 0 0 14.4Z" fill="currentColor" />
  </svg>
</template>
