<script setup lang="ts">
import AppScreen from '@/shared/components/AppScreen.vue'
import { useAppStore } from '@/stores/app'

const app = useAppStore()
</script>

<template>
  <AppScreen>
    <header>
      <p class="text-sm font-semibold tracking-wide text-accent">Для ежедневной работы врача</p>
      <h1 class="mt-2 text-[2rem] leading-tight font-semibold text-ink">{{ app.name }}</h1>
    </header>

    <p class="mt-4 text-base leading-relaxed text-muted">
      {{ app.description }} Решение остаётся за кардиологом.
    </p>

    <section class="mt-8" aria-labelledby="modules-title">
      <h2 id="modules-title" class="text-sm font-semibold text-ink">Модули</h2>
      <ul class="mt-3 flex flex-col gap-3">
        <li
          v-for="feature in app.modules"
          :key="feature.id"
          class="rounded-2xl border border-line bg-white px-4 py-4"
        >
          <h3 class="text-lg font-semibold text-ink">{{ feature.title }}</h3>
          <p class="mt-1 text-sm leading-relaxed text-muted">{{ feature.summary }}</p>
        </li>
      </ul>
    </section>

    <p class="mt-8 text-sm leading-relaxed text-muted">
      Это не медицинское изделие и не заменяет клиническое решение. Сейчас собран каркас: навигация,
      расчёты и картотека появятся следующими шагами.
    </p>
  </AppScreen>
</template>
