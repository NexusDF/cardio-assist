<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { searchPlaces } from '../api'
import type { Place } from '../types'

const emit = defineEmits<{
  select: [place: Place]
}>()

const input = ref('')
const debounced = ref('')
let timer = 0

watch(input, (value) => {
  window.clearTimeout(timer)
  timer = window.setTimeout(() => {
    debounced.value = value.trim()
  }, 250)
})

const queryText = computed(() => debounced.value)
const enabled = computed(() => queryText.value.length >= 2)

const { data, isPending, isError, isFetching } = useQuery({
  queryKey: computed(() => ['places', queryText.value] as const),
  queryFn: ({ queryKey }) => searchPlaces(queryKey[1]),
  enabled,
  staleTime: 5 * 60 * 1000,
})

const places = computed(() => data.value ?? [])

function submit() {
  const first = places.value[0]
  if (first) emit('select', first)
}
</script>

<template>
  <form class="flex flex-1 flex-col pb-[max(1.75rem,env(safe-area-inset-bottom))]" @submit.prevent="submit">
    <label class="sr-only" for="city">Город</label>
    <input
      id="city"
      v-model="input"
      type="text"
      inputmode="search"
      name="city"
      autocomplete="off"
      spellcheck="false"
      enterkeyhint="search"
      placeholder="Город"
      autofocus
      class="mt-8 w-full bg-transparent text-[2rem] leading-none font-bold tracking-[-0.03em] outline-none placeholder:text-muted/40"
    />

    <p v-if="input.trim().length === 1" class="mt-6 text-[15px] text-muted">Ещё хотя бы одну букву.</p>
    <p v-else-if="enabled && isPending" class="mt-6 text-[15px] text-muted">Ищем…</p>
    <p v-else-if="enabled && isError" class="mt-6 text-[15px] text-muted">Поиск не ответил. Попробуйте ещё раз.</p>
    <p v-else-if="enabled && !isFetching && places.length === 0" class="mt-6 text-[15px] text-muted">Такого города нет.</p>

    <ul v-else-if="places.length > 0" class="mt-6">
      <li v-for="place in places" :key="place.id">
        <button
          type="button"
          class="w-full border-t border-line py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          @click="emit('select', place)"
        >
          <span class="block text-[20px] leading-tight font-semibold tracking-[-0.02em]">{{ place.name }}</span>
          <span v-if="place.region" class="mt-1 block text-[14px] text-muted">{{ place.region }}</span>
        </button>
      </li>
    </ul>
  </form>
</template>
