<script setup lang="ts">
import type { FeatureId } from '@/shared/feature'

defineProps<{
  id: FeatureId
}>()
</script>

<template>
  <svg
    v-if="id === 'calculators'"
    viewBox="0 0 24 24"
    class="size-6 shrink-0"
    aria-hidden="true"
    focusable="false"
  >
    <rect
      x="4"
      y="3"
      width="16"
      height="18"
      rx="2"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
    />
    <path
      d="M8 8h8M8 12h3M13 12h3M8 16h3M13 16h3"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
    />
  </svg>
  <svg
    v-else-if="id === 'ecg'"
    viewBox="0 0 24 24"
    class="size-6 shrink-0"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M2.5 13h4.2l1.5-3 2.2 6.5L13 6.5l2.3 9.2 1.6-2.7H21.5"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
  <svg
    v-else-if="id === 'patients'"
    viewBox="0 0 24 24"
    class="size-6 shrink-0"
    aria-hidden="true"
    focusable="false"
  >
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
    />
    <circle cx="9" cy="11" r="2" fill="none" stroke="currentColor" stroke-width="1.8" />
    <path
      d="M6.5 16c.6-1.4 1.6-2 2.5-2s1.9.6 2.5 2M14 10h4M14 13.5h4"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
  <svg v-else viewBox="0 0 24 24" class="size-6 shrink-0" aria-hidden="true" focusable="false">
    <path
      d="M4 8h16M4 16h16"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
    />
    <circle cx="9" cy="8" r="2.2" fill="var(--surface)" stroke="currentColor" stroke-width="1.8" />
    <circle
      cx="15"
      cy="16"
      r="2.2"
      fill="var(--surface)"
      stroke="currentColor"
      stroke-width="1.8"
    />
  </svg>
</template>
