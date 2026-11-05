<script setup lang="ts">
import { computed } from 'vue'
import type { CalculatorSnapshot } from '@/features/calculators/logic/drafts'
import { useAppI18n } from '@/shared/i18n'
import { useCalculatorDraftsStore } from '@/stores/calculator-drafts'

const props = defineProps<{
  calculator: CalculatorSnapshot['calculator']
}>()

const { t } = useAppI18n()
const draftsStore = useCalculatorDraftsStore()

const items = computed(() =>
  draftsStore.drafts.filter((draft) => draft.snapshot.calculator === props.calculator),
)

function label(snapshot: CalculatorSnapshot): string {
  if (snapshot.calculator === 'qtc') {
    const bazett = snapshot.formulas.find((item) => item.id === 'bazett')
    return t('calculators.drafts.qtc', { value: bazett?.qtcMs ?? 0 })
  }
  if (snapshot.calculator === 'cha2ds2-vasc') {
    return t('calculators.drafts.cha2ds2Vasc', { score: snapshot.score, max: snapshot.maxScore })
  }
  if (snapshot.calculator === 'has-bled') {
    return t('calculators.drafts.hasBled', { score: snapshot.score, max: snapshot.maxScore })
  }
  return t('calculators.drafts.heart', { score: snapshot.score, max: snapshot.maxScore })
}

function time(createdAt: string): string {
  return new Intl.DateTimeFormat('ru', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(createdAt),
  )
}
</script>

<template>
  <section v-if="items.length > 0" class="mt-8" aria-labelledby="drafts-title">
    <h2 id="drafts-title" class="text-sm font-semibold text-ink">
      {{ t('calculators.drafts.title') }}
    </h2>
    <p class="mt-1 text-sm leading-relaxed text-muted">{{ t('calculators.drafts.hint') }}</p>
    <ul class="mt-3 flex flex-col gap-2">
      <li
        v-for="item in items"
        :key="item.id"
        class="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3 py-2"
      >
        <div>
          <p class="text-base font-semibold text-ink">{{ label(item.snapshot) }}</p>
          <p class="text-sm text-muted">{{ time(item.createdAt) }}</p>
        </div>
        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-semibold text-ink"
          @click="draftsStore.remove(item.id)"
        >
          {{ t('calculators.drafts.remove') }}
        </button>
      </li>
    </ul>
  </section>
</template>
