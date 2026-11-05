<script setup lang="ts">
import { computed, ref } from 'vue'
import CalculatorPage from '@/features/calculators/components/CalculatorPage.vue'
import DraftList from '@/features/calculators/components/DraftList.vue'
import NumberField from '@/features/calculators/components/NumberField.vue'
import RadioGroup from '@/features/calculators/components/RadioGroup.vue'
import SaveToPatient from '@/features/calculators/components/SaveToPatient.vue'
import SourceNote from '@/features/calculators/components/SourceNote.vue'
import { parsePositiveNumber } from '@/features/calculators/logic/parse'
import { computeQtc, qtcReviewedOn, type QtcBand, type Sex } from '@/features/calculators/logic/qtc'
import { useAppI18n } from '@/shared/i18n'

const { t } = useAppI18n()

const qt = ref('')
const rateMode = ref<'heart-rate' | 'rr'>('heart-rate')
const rate = ref('')
const sex = ref<Sex | ''>('')

const sexOptions = computed(() => [
  { value: 'male', label: t('calculators.qtc.male') },
  { value: 'female', label: t('calculators.qtc.female') },
])

const rateOptions = computed(() => [
  { value: 'heart-rate', label: t('calculators.qtc.byHeartRate') },
  { value: 'rr', label: t('calculators.qtc.byRr') },
])

const result = computed(() => {
  const qtMs = parsePositiveNumber(qt.value)
  const rateValue = parsePositiveNumber(rate.value)
  if (qtMs === null || rateValue === null || (sex.value !== 'male' && sex.value !== 'female'))
    return null
  return computeQtc({
    qtMs,
    sex: sex.value,
    rate:
      rateMode.value === 'heart-rate'
        ? { mode: 'heart-rate', heartRateBpm: rateValue }
        : { mode: 'rr', rrSeconds: rateValue },
  })
})

const snapshot = computed(() => {
  const current = result.value
  if (current === null) return null
  return {
    calculator: 'qtc' as const,
    sex: current.sex,
    qtMs: current.qtMs,
    heartRateBpm: current.heartRateBpm,
    rrSeconds: current.rrSeconds,
    formulas: current.formulas,
  }
})

function bandLabel(band: QtcBand): string {
  if (band === 'high') return t('calculators.qtc.bands.high')
  if (band === 'prolonged') return t('calculators.qtc.bands.prolonged')
  return t('calculators.qtc.bands.normal')
}

function bandClass(band: QtcBand): string {
  if (band === 'high') return 'border-danger bg-danger-surface'
  if (band === 'prolonged') return 'border-warn bg-warn-surface'
  return 'border-line bg-surface'
}

function formulaName(id: 'bazett' | 'fridericia' | 'framingham' | 'hodges'): string {
  return t(`calculators.qtc.formulas.${id}`)
}

function onSex(value: string) {
  sex.value = value === 'female' ? 'female' : 'male'
}

function onRateMode(value: string) {
  rateMode.value = value === 'rr' ? 'rr' : 'heart-rate'
}
</script>

<template>
  <CalculatorPage :title="t('calculators.qtc.title')">
    <p class="mt-3 text-base leading-relaxed text-muted">{{ t('calculators.qtc.lead') }}</p>
    <div class="mt-6 flex flex-col gap-5">
      <NumberField
        v-model="qt"
        :label="t('calculators.qtc.qt')"
        :hint="t('calculators.qtc.qtHint')"
      />
      <RadioGroup
        :legend="t('calculators.qtc.rateMode')"
        name="qtc-rate-mode"
        :model-value="rateMode"
        :options="rateOptions"
        @update:model-value="onRateMode"
      />
      <NumberField
        v-model="rate"
        :label="
          rateMode === 'heart-rate' ? t('calculators.qtc.heartRate') : t('calculators.qtc.rr')
        "
        :hint="
          rateMode === 'heart-rate'
            ? t('calculators.qtc.heartRateHint')
            : t('calculators.qtc.rrHint')
        "
      />
      <RadioGroup
        :legend="t('calculators.qtc.sex')"
        name="qtc-sex"
        :model-value="sex"
        :options="sexOptions"
        @update:model-value="onSex"
      />
    </div>

    <section v-if="result" class="mt-6" aria-live="polite">
      <h2 class="text-sm font-semibold text-ink">{{ t('calculators.result') }}</h2>
      <ul class="mt-3 flex flex-col gap-2">
        <li
          v-for="formula in result.formulas"
          :key="formula.id"
          class="rounded-2xl border px-4 py-3"
          :class="bandClass(formula.band)"
        >
          <p class="text-sm text-muted">{{ formulaName(formula.id) }}</p>
          <p class="mt-1 text-2xl font-semibold text-ink">
            {{ formula.qtcMs }} {{ t('calculators.qtc.ms') }}
          </p>
          <p class="mt-1 text-sm font-semibold text-ink">{{ bandLabel(formula.band) }}</p>
          <p
            v-if="formula.id === 'bazett' && result.bazettTachycardiaWarning"
            class="mt-2 text-sm leading-relaxed text-warn"
          >
            {{ t('calculators.qtc.bazettWarning') }}
          </p>
        </li>
      </ul>
    </section>
    <p v-else class="mt-6 text-sm leading-relaxed text-muted">
      {{ t('calculators.qtc.needInput') }}
    </p>

    <SaveToPatient :snapshot="snapshot" />
    <DraftList calculator="qtc" />
    <SourceNote
      :source="t('calculators.qtc.source')"
      :reviewed-on="qtcReviewedOn"
      :todo="t('calculators.qtc.todo')"
    />
  </CalculatorPage>
</template>
