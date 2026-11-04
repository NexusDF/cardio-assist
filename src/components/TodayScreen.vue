<script setup lang="ts">
import { computed } from 'vue'
import { buildToday } from '../insights'
import type { Forecast } from '../types'

const props = defineProps<{
  forecast: Forecast | undefined
  pending: boolean
  error: boolean
}>()

defineEmits<{
  retry: []
  week: []
}>()

const today = computed(() => (props.forecast ? buildToday(props.forecast) : null))

const rows = computed(() => {
  if (!today.value) return []
  return [
    { label: 'Что надеть', value: today.value.wear },
    { label: 'Осадки', value: today.value.precip },
    { label: today.value.nextLabel, value: today.value.next },
  ]
})

</script>

<template>
  <section v-if="pending" class="flex flex-1 animate-pulse flex-col pb-8">
    <div class="mt-10 h-3 w-16 rounded-full bg-track" />
    <div class="mt-6 h-28 w-44 rounded-3xl bg-track" />
    <div class="mt-10 h-8 w-4/5 rounded-full bg-track" />
    <div class="mt-3 h-8 w-3/5 rounded-full bg-track" />
    <div class="mt-10 space-y-7">
      <div v-for="item in 3" :key="item" class="border-t border-line pt-4">
        <div class="h-3 w-24 rounded-full bg-track" />
        <div class="mt-3 h-5 w-56 rounded-full bg-track" />
      </div>
    </div>
  </section>

  <section v-else-if="error || !today" class="flex flex-1 flex-col pb-8">
    <p class="mt-16 text-[2rem] leading-[1.05] font-extrabold tracking-[-0.03em]">
      Не удалось загрузить погоду.
    </p>
    <p class="mt-3 text-[15px] text-muted">Проверьте сеть и попробуйте ещё раз.</p>
    <div class="mt-auto pt-8">
      <button
        type="button"
        class="flex h-14 w-full items-center justify-center rounded-full bg-accent text-[17px] font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        @click="$emit('retry')"
      >
        Повторить
      </button>
    </div>
  </section>

  <section v-else class="@container flex flex-1 flex-col pb-[max(1.75rem,env(safe-area-inset-bottom))]">
    <p class="mt-7 text-[12px] font-semibold tracking-[0.16em] text-muted uppercase">Сейчас</p>
    <p class="mt-2 text-[clamp(6rem,40cqi,8.5rem)] leading-[0.8] font-extrabold tracking-[-0.055em] text-accent">
      {{ today.temperature }}
    </p>
    <h2 class="mt-6 text-[clamp(1.85rem,11.5cqi,2.35rem)] leading-[1.05] font-extrabold tracking-[-0.04em]">
      <span class="block">{{ today.lead }}</span>
      <span class="block">{{ today.adviceTop }}</span>
      <span class="block">{{ today.adviceBottom }}</span>
    </h2>

    <div class="mt-7">
      <div v-for="row in rows" :key="row.label" class="border-t border-line py-3.5">
        <p class="text-[12px] font-semibold tracking-[0.14em] text-muted uppercase">{{ row.label }}</p>
        <p class="mt-2 text-[20px] leading-snug font-semibold tracking-[-0.02em]">{{ row.value }}</p>
      </div>
    </div>

    <div class="border-t border-line pt-4">
      <p class="text-[12px] font-semibold tracking-[0.14em] text-muted uppercase">Сегодня по часам</p>
      <div
        class="relative mt-4 h-[14px] overflow-hidden rounded-full bg-track"
        role="img"
        :aria-label="today.precip"
      >
        <span
          v-for="(segment, index) in today.segments"
          :key="index"
          class="absolute inset-y-0 bg-accent"
          :style="{ left: segment.left, width: segment.width }"
        />
      </div>
      <div class="mt-2 flex justify-between text-[12px] font-medium text-muted tabular-nums">
        <span>00</span>
        <span>06</span>
        <span>12</span>
        <span>18</span>
        <span>24</span>
      </div>
    </div>

    <div class="mt-auto pt-6">
      <button
        type="button"
        class="flex h-14 w-full items-center justify-center rounded-full bg-accent text-[17px] font-semibold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent active:brightness-95"
        @click="$emit('week')"
      >
        Прогноз на неделю
      </button>
    </div>
  </section>
</template>
