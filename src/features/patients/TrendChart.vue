<script setup lang="ts">
import { computed } from 'vue'
import { chartDots, type TrendPoint } from '@/features/patients/logic/trends'

const props = defineProps<{
  title: string
  points: readonly TrendPoint[]
}>()

const dots = computed(() => chartDots(props.points, 320, 140))
const line = computed(() => dots.value.map((dot) => `${dot.x},${dot.y}`).join(' '))

function time(at: string): string {
  return new Intl.DateTimeFormat('ru', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(at),
  )
}
</script>

<template>
  <section class="rounded-2xl border border-line bg-surface px-4 py-4">
    <h3 class="text-sm font-semibold text-ink">{{ title }}</h3>
    <svg viewBox="0 0 320 140" class="mt-3 w-full text-accent" aria-hidden="true">
      <polyline
        v-if="dots.length > 1"
        :points="line"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
      <circle v-for="dot in dots" :key="dot.at" :cx="dot.x" :cy="dot.y" r="4" fill="currentColor" />
    </svg>
    <ul class="mt-3 flex flex-col gap-1 text-sm text-muted">
      <li v-for="dot in dots" :key="`${dot.at}-label`">{{ time(dot.at) }} · {{ dot.value }}</li>
    </ul>
  </section>
</template>
