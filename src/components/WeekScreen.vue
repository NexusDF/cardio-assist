<script setup lang="ts">
import { computed } from 'vue'
import { buildWeek } from '../insights'
import type { Forecast } from '../types'

const props = defineProps<{
  forecast: Forecast | undefined
  pending: boolean
  error: boolean
}>()

defineEmits<{
  retry: []
}>()

const days = computed(() => (props.forecast ? buildWeek(props.forecast) : []))
</script>

<template>
  <section v-if="pending" class="mt-8 flex-1 animate-pulse space-y-5">
    <div v-for="item in 7" :key="item" class="border-t border-line py-4">
      <div class="h-5 w-40 rounded-full bg-track" />
      <div class="mt-3 h-4 w-28 rounded-full bg-track" />
    </div>
  </section>

  <section v-else-if="error || days.length === 0" class="flex flex-1 flex-col pb-8">
    <p class="mt-16 text-[2rem] leading-[1.05] font-extrabold tracking-[-0.03em]">
      Неделя не загрузилась.
    </p>
    <div class="mt-auto pt-8">
      <button
        type="button"
        class="flex h-14 w-full items-center justify-center rounded-full bg-accent text-[17px] font-semibold text-white"
        @click="$emit('retry')"
      >
        Повторить
      </button>
    </div>
  </section>

  <ul v-else class="mt-8 pb-[max(1.75rem,env(safe-area-inset-bottom))]">
    <li v-for="day in days" :key="day.date" class="flex items-baseline justify-between gap-4 border-t border-line py-4">
      <div class="min-w-0">
        <p class="text-[1.35rem] leading-none font-bold tracking-[-0.03em]" :class="day.isToday ? 'text-accent' : 'text-ink'">
          {{ day.weekday }}
        </p>
        <p class="mt-2 truncate text-[14px] font-medium text-muted">{{ day.dateLabel }} · {{ day.condition }}</p>
      </div>
      <p class="shrink-0 text-[1.35rem] leading-none font-semibold tracking-[-0.03em] tabular-nums">
        <span class="text-muted">{{ day.min }}</span>
        <span class="ml-3 text-accent">{{ day.max }}</span>
      </p>
    </li>
  </ul>
</template>
