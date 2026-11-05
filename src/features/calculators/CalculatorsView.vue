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
          class="flex min-h-16 flex-col justify-center rounded-2xl border border-line bg-surface px-4 py-4"
        >
          <span class="text-lg font-semibold text-ink">{{ t(item.title) }}</span>
          <span class="mt-1 text-sm leading-relaxed text-muted">{{ t(item.summary) }}</span>
        </RouterLink>
      </li>
    </ul>
  </AppScreen>
</template>
