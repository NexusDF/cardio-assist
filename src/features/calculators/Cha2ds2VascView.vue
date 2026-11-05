<script setup lang="ts">
import { computed, ref } from 'vue'
import CalculatorPage from '@/features/calculators/components/CalculatorPage.vue'
import CheckField from '@/features/calculators/components/CheckField.vue'
import DraftList from '@/features/calculators/components/DraftList.vue'
import NumberField from '@/features/calculators/components/NumberField.vue'
import RadioGroup from '@/features/calculators/components/RadioGroup.vue'
import SourceNote from '@/features/calculators/components/SourceNote.vue'
import { cha2ds2Vasc, cha2ds2VascReviewedOn } from '@/features/calculators/logic/cha2ds2vasc'
import { parseAgeYears } from '@/features/calculators/logic/parse'
import { useAppI18n } from '@/shared/i18n'
import { useCalculatorDraftsStore } from '@/stores/calculator-drafts'

const { t } = useAppI18n()
const drafts = useCalculatorDraftsStore()
const age = ref('')
const female = ref<'female' | 'male' | ''>('')
const heartFailure = ref(false)
const hypertension = ref(false)
const diabetes = ref(false)
const stroke = ref(false)
const vascularDisease = ref(false)
const saved = ref(false)

const sexOptions = computed(() => [
  { value: 'male', label: t('calculators.qtc.male') },
  { value: 'female', label: t('calculators.qtc.female') },
])

const result = computed(() => {
  const ageYears = parseAgeYears(age.value)
  if (ageYears === null || female.value === '') return null
  return cha2ds2Vasc({
    ageYears,
    female: female.value === 'female',
    heartFailure: heartFailure.value,
    hypertension: hypertension.value,
    diabetes: diabetes.value,
    stroke: stroke.value,
    vascularDisease: vascularDisease.value,
  })
})

const points = computed(() => {
  const current = result.value
  if (current === null) return []
  return [
    ['heartFailure', current.points.heartFailure],
    ['hypertension', current.points.hypertension],
    ['age', current.points.age],
    ['diabetes', current.points.diabetes],
    ['stroke', current.points.stroke],
    ['vascular', current.points.vascularDisease],
    ['female', current.points.female],
  ] as const
})

function save() {
  const current = result.value
  if (current === null) return
  drafts.save({ calculator: 'cha2ds2-vasc', score: current.score, maxScore: current.maxScore })
  saved.value = true
}

function onSex(value: string) {
  female.value = value === 'female' ? 'female' : 'male'
  saved.value = false
}
</script>

<template>
  <CalculatorPage :title="t('calculators.cha2ds2Vasc.title')">
    <p class="mt-3 text-base leading-relaxed text-muted">{{ t('calculators.cha2ds2Vasc.lead') }}</p>
    <div class="mt-6 flex flex-col gap-3">
      <NumberField
        v-model="age"
        numeric
        :label="t('calculators.age')"
        @update:model-value="saved = false"
      />
      <RadioGroup
        :legend="t('calculators.qtc.sex')"
        name="cha-sex"
        :model-value="female"
        :options="sexOptions"
        @update:model-value="onSex"
      />
      <CheckField
        v-model="heartFailure"
        :label="t('calculators.cha2ds2Vasc.heartFailure')"
        @update:model-value="saved = false"
      />
      <CheckField
        v-model="hypertension"
        :label="t('calculators.cha2ds2Vasc.hypertension')"
        @update:model-value="saved = false"
      />
      <CheckField
        v-model="diabetes"
        :label="t('calculators.cha2ds2Vasc.diabetes')"
        @update:model-value="saved = false"
      />
      <CheckField
        v-model="stroke"
        :label="t('calculators.cha2ds2Vasc.stroke')"
        @update:model-value="saved = false"
      />
      <CheckField
        v-model="vascularDisease"
        :label="t('calculators.cha2ds2Vasc.vascular')"
        @update:model-value="saved = false"
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
      <ul class="mt-3 flex flex-col gap-1 text-sm text-muted">
        <li v-for="point in points" :key="point[0]">
          {{ t(`calculators.cha2ds2Vasc.points.${point[0]}`) }}: {{ point[1] }}
        </li>
      </ul>
      <p class="mt-3 text-sm leading-relaxed text-ink">
        {{ t('calculators.cha2ds2Vasc.interpretation') }}
      </p>
    </section>
    <p v-else class="mt-6 text-sm text-muted">{{ t('calculators.cha2ds2Vasc.needInput') }}</p>
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
    <DraftList calculator="cha2ds2-vasc" />
    <SourceNote
      :source="t('calculators.cha2ds2Vasc.source')"
      :reviewed-on="cha2ds2VascReviewedOn"
      :todo="t('calculators.cha2ds2Vasc.todo')"
    />
  </CalculatorPage>
</template>
