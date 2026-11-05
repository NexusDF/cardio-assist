<script setup lang="ts">
import AppScreen from './AppScreen.vue'

defineProps<{
  title: string
  body: string
}>()
</script>

<template>
  <AppScreen>
    <h1 class="text-[2rem] leading-tight font-semibold text-ink">{{ title }}</h1>
    <p
      class="mt-4 rounded-2xl border border-line bg-surface px-4 py-4 text-base leading-relaxed text-muted"
    >
      {{ body }}
    </p>
  </AppScreen>
</template>
