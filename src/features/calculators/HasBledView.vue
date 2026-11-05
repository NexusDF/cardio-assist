<script setup lang="ts">
import { computed, ref } from 'vue'
import CalculatorPage from '@/features/calculators/components/CalculatorPage.vue'
import CheckField from '@/features/calculators/components/CheckField.vue'
import DraftList from '@/features/calculators/components/DraftList.vue'
import NumberField from '@/features/calculators/components/NumberField.vue'
import SaveToPatient from '@/features/calculators/components/SaveToPatient.vue'
import SourceNote from '@/features/calculators/components/SourceNote.vue'
import { hasBled, hasBledReviewedOn } from '@/features/calculators/logic/hasbled'
import { parseAgeYears } from '@/features/calculators/logic/parse'
import { useAppI18n } from '@/shared/i18n'

const { t } = useAppI18n()
const age = ref('')
const hypertension = ref(false)
const renal = ref(false)
const liver = ref(false)
const stroke = ref(false)
const bleeding = ref(false)
const labileInr = ref(false)
const drugs = ref(false)
const alcohol = ref(false)

const result = computed(() => {
  const ageYears = parseAgeYears(age.value)
  if (ageYears === null) return null
  return hasBled({
    ageYears,
    hypertension: hypertension.value,
    renal: renal.value,
    liver: liver.value,
    stroke: stroke.value,
    bleeding: bleeding.value,
    labileInr: labileInr.value,
    drugs: drugs.value,
    alcohol: alcohol.value,
  })
})

const snapshot = computed(() => {
  const current = result.value
  if (current === null) return null
  return { calculator: 'has-bled' as const, score: current.score, maxScore: current.maxScore }
})
</script>

<template>
  <CalculatorPage :title="t('calculators.hasBled.title')">
    <p class="mt-3 text-base leading-relaxed text-muted">{{ t('calculators.hasBled.lead') }}</p>
    <div class="mt-6 flex flex-col gap-3">
      <NumberField
        v-model="age"
        numeric
        :label="t('calculators.age')"
        :hint="t('calculators.hasBled.ageHint')"
      />
      <CheckField v-model="hypertension" :label="t('calculators.hasBled.hypertension')" />
      <CheckField v-model="renal" :label="t('calculators.hasBled.renal')" />
      <CheckField v-model="liver" :label="t('calculators.hasBled.liver')" />
      <CheckField v-model="stroke" :label="t('calculators.hasBled.stroke')" />
      <CheckField v-model="bleeding" :label="t('calculators.hasBled.bleeding')" />
      <CheckField v-model="labileInr" :label="t('calculators.hasBled.labileInr')" />
      <CheckField v-model="drugs" :label="t('calculators.hasBled.drugs')" />
      <CheckField v-model="alcohol" :label="t('calculators.hasBled.alcohol')" />
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
      <p class="mt-3 text-sm leading-relaxed text-ink">
        {{ t('calculators.hasBled.interpretation') }}
      </p>
    </section>
    <p v-else class="mt-6 text-sm text-muted">{{ t('calculators.hasBled.needInput') }}</p>
    <SaveToPatient :snapshot="snapshot" />
    <DraftList calculator="has-bled" />
    <SourceNote
      :source="t('calculators.hasBled.source')"
      :reviewed-on="hasBledReviewedOn"
      :todo="t('calculators.hasBled.todo')"
    />
  </CalculatorPage>
</template>
