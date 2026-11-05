<script setup lang="ts">
import AppScreen from '@/shared/components/AppScreen.vue'
import { useAppI18n } from '@/shared/i18n'

const { t } = useAppI18n()

const items = [
  { name: 'calculator-qtc', title: 'calculators.qtc.title', summary: 'calculators.qtc.summary' },
  {
    name: 'calculator-cha2ds2-vasc',
    title: 'calculators.cha2ds2Vasc.title',
    summary: 'calculators.cha2ds2Vasc.summary',
  },
  {
    name: 'calculator-has-bled',
    title: 'calculators.hasBled.title',
    summary: 'calculators.hasBled.summary',
  },
  {
    name: 'calculator-heart',
    title: 'calculators.heart.title',
    summary: 'calculators.heart.summary',
  },
] as const
</script>

<template>
  <AppScreen>
    <h1 class="text-[2rem] leading-tight font-semibold text-ink">{{ t('calculators.title') }}</h1>
    <p class="mt-3 text-base leading-relaxed text-muted">{{ t('calculators.lead') }}</p>
    <ul class="mt-6 flex flex-col gap-3">
      <li v-for="item in items" :key="item.name">
        <RouterLink
          :to="{ name: item.name }"
          class="flex min-h-16 items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-4 active:border-accent active:bg-paper"
        >
          <span class="min-w-0 flex-1">
            <span class="block text-lg font-semibold text-ink">{{ t(item.title) }}</span>
            <span class="mt-1 block text-sm leading-relaxed text-muted">{{ t(item.summary) }}</span>
          </span>
          <svg
            viewBox="0 0 24 24"
            class="size-6 shrink-0 text-accent"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M9 6l6 6-6 6"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </RouterLink>
      </li>
    </ul>
  </AppScreen>
</template>
