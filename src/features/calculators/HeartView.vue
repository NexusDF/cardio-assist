<script setup lang="ts">
import { computed, ref } from 'vue'
import CalculatorPage from '@/features/calculators/components/CalculatorPage.vue'
import DraftList from '@/features/calculators/components/DraftList.vue'
import RadioGroup from '@/features/calculators/components/RadioGroup.vue'
import SourceNote from '@/features/calculators/components/SourceNote.vue'
import {
  heartReviewedOn,
  heartScore,
  isHeartLevel,
  type HeartLevel,
} from '@/features/calculators/logic/heart'
import { useAppI18n } from '@/shared/i18n'
import { useCalculatorDraftsStore } from '@/stores/calculator-drafts'

const { t } = useAppI18n()
const drafts = useCalculatorDraftsStore()
const history = ref('')
const ecg = ref('')
const age = ref('')
const riskFactors = ref('')
const troponin = ref('')
const saved = ref(false)

function options(group: 'history' | 'ecg' | 'age' | 'riskFactors' | 'troponin') {
  return [0, 1, 2].map((level) => ({
    value: String(level),
    label: t(`calculators.heart.options.${group}.${level}`),
  }))
}

function level(raw: string): HeartLevel | null {
  const value = Number(raw)
  return isHeartLevel(value) ? value : null
}

const result = computed(() => {
  const historyLevel = level(history.value)
  const ecgLevel = level(ecg.value)
  const ageLevel = level(age.value)
  const riskLevel = level(riskFactors.value)
  const troponinLevel = level(troponin.value)
  if (
    historyLevel === null ||
    ecgLevel === null ||
    ageLevel === null ||
    riskLevel === null ||
    troponinLevel === null
  ) {
    return null
  }
  return heartScore({
    history: historyLevel,
    ecg: ecgLevel,
    age: ageLevel,
    riskFactors: riskLevel,
    troponin: troponinLevel,
  })
})

function save() {
  const current = result.value
  if (current === null) return
  drafts.save({
    calculator: 'heart',
    score: current.score,
    maxScore: current.maxScore,
    band: current.band,
  })
  saved.value = true
}

function setLevel(field: 'history' | 'ecg' | 'age' | 'riskFactors' | 'troponin', value: string) {
  const target = { history, ecg, age, riskFactors, troponin }[field]
  target.value = value
  saved.value = false
}
</script>

<template>
  <CalculatorPage :title="t('calculators.heart.title')">
    <p class="mt-3 text-base leading-relaxed text-muted">{{ t('calculators.heart.lead') }}</p>
    <div class="mt-6 flex flex-col gap-5">
      <RadioGroup
        :legend="t('calculators.heart.history')"
        name="heart-history"
        :model-value="history"
        :options="options('history')"
        @update:model-value="setLevel('history', $event)"
      />
      <RadioGroup
        :legend="t('calculators.heart.ecg')"
        name="heart-ecg"
        :model-value="ecg"
        :options="options('ecg')"
        @update:model-value="setLevel('ecg', $event)"
      />
      <RadioGroup
        :legend="t('calculators.heart.age')"
        name="heart-age"
        :model-value="age"
        :options="options('age')"
        @update:model-value="setLevel('age', $event)"
      />
      <RadioGroup
        :legend="t('calculators.heart.riskFactors')"
        name="heart-risk"
        :model-value="riskFactors"
        :options="options('riskFactors')"
        @update:model-value="setLevel('riskFactors', $event)"
      />
      <RadioGroup
        :legend="t('calculators.heart.troponin')"
        name="heart-troponin"
        :model-value="troponin"
        :options="options('troponin')"
        @update:model-value="setLevel('troponin', $event)"
      />
    </div>
    <section
      v-if="result"
      class="mt-6 rounded-2xl border border-line bg-surface px-4 py-4"
      aria-live="polite"
    >
      <h2 class="text-sm font-semibold text-ink">{{ t('calculators.result') }}</h2>
      <p class="mt-2 text-3xl font-semibold text-ink">
        {{ result.score }}<span class="text-lg text-muted"> / {{ result.maxScore }}</span>
      </p>
      <p class="mt-2 text-base font-semibold text-ink">
        {{ t(`calculators.heart.bands.${result.band}`) }}
      </p>
      <p class="mt-3 text-sm leading-relaxed text-ink">
        {{ t('calculators.heart.interpretation') }}
      </p>
    </section>
    <p v-else class="mt-6 text-sm text-muted">{{ t('calculators.heart.needInput') }}</p>
    <button
      type="button"
      class="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl px-4 text-base font-semibold"
      :class="result ? 'bg-accent text-on-accent' : 'border border-line bg-surface text-muted'"
      :disabled="result === null"
      @click="save"
    >
      {{ t('calculators.save') }}
    </button>
    <p v-if="saved" class="mt-3 text-sm leading-relaxed text-muted" role="status">
      {{ t('calculators.saved') }}
    </p>
    <DraftList calculator="heart" />
    <SourceNote
      :source="t('calculators.heart.source')"
      :reviewed-on="heartReviewedOn"
      :todo="t('calculators.heart.todo')"
    />
  </CalculatorPage>
</template>
