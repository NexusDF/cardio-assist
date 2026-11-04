<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchForecast, loadPlace, savePlace } from './api'
import { formatToday } from './format'
import type { Place } from './types'
import TodayScreen from './components/TodayScreen.vue'
import WeekScreen from './components/WeekScreen.vue'
import SearchScreen from './components/SearchScreen.vue'

const place = ref<Place>(loadPlace())
const screen = ref<'today' | 'week' | 'search'>('today')

watch(place, (value) => savePlace(value))

const { data, isPending, isError, refetch } = useQuery({
  queryKey: computed(() => ['forecast', place.value.latitude, place.value.longitude] as const),
  queryFn: ({ queryKey }) => fetchForecast(queryKey[1], queryKey[2]),
})

const todayLabel = computed(() => formatToday(data.value?.timezone ?? place.value.timezone))

function chooseCity(next: Place) {
  place.value = next
  screen.value = 'today'
}
</script>

<template>
  <main class="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col px-6 pt-6">
    <header class="flex items-center justify-between gap-4">
      <div class="min-w-0">
        <h1 class="truncate text-[2.2rem] leading-none font-bold tracking-[-0.03em]">
          {{ screen === 'search' ? 'Поиск' : place.name }}
        </h1>
        <p class="mt-2 text-[15px] leading-none font-medium text-muted">
          {{ screen === 'week' ? '7 дней' : screen === 'search' ? 'Город' : todayLabel }}
        </p>
      </div>

      <button
        v-if="screen === 'today'"
        type="button"
        class="grid h-11 w-11 shrink-0 place-items-center rounded-full border-[1.5px] border-ink text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        aria-label="Найти город"
        @click="screen = 'search'"
      >
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path stroke-linecap="round" d="M16 16.5 20 20.5" />
        </svg>
      </button>
      <button
        v-else
        type="button"
        class="grid h-11 w-11 shrink-0 place-items-center rounded-full border-[1.5px] border-ink text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        aria-label="Назад"
        @click="screen = 'today'"
      >
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.5 6.5 8.5 12l6 5.5" />
        </svg>
      </button>
    </header>

    <TodayScreen
      v-if="screen === 'today'"
      class="flex flex-1 flex-col"
      :forecast="data"
      :pending="isPending"
      :error="isError"
      @retry="refetch()"
      @week="screen = 'week'"
    />
    <WeekScreen v-else-if="screen === 'week'" :forecast="data" :pending="isPending" :error="isError" @retry="refetch()" />
    <SearchScreen v-else @select="chooseCity" />
  </main>
</template>
