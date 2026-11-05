<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { CalculatorSnapshot } from '@/features/calculators/logic/drafts'
import AppScreen from '@/shared/components/AppScreen.vue'
import RadioGroup from '@/features/calculators/components/RadioGroup.vue'
import { useAppI18n } from '@/shared/i18n'
import { usePatientsStore } from '@/stores/patients'
import type { PatientSex } from '@/features/patients/logic/patients'

const { t } = useAppI18n()
const route = useRoute()
const router = useRouter()
const patientsStore = usePatientsStore()

const code = ref('')
const ageYears = ref('')
const sex = ref<PatientSex>('')
const notes = ref('')
const ageError = ref(false)
const saved = ref(false)
const confirmDelete = ref(false)
const loadedFor = ref<string | null>(null)

const isNew = computed(() => route.name === 'patient-new')
const patientId = computed(() => (typeof route.params.id === 'string' ? route.params.id : null))

const sexOptions = computed(() => [
  { value: '', label: t('patients.sexUnspecified') },
  { value: 'male', label: t('patients.sexMale') },
  { value: 'female', label: t('patients.sexFemale') },
])

const patient = computed(
  () => patientsStore.patients.find((item) => item.id === patientId.value) ?? null,
)

const results = computed(() =>
  patientsStore.results.filter((item) => item.patientId === patientId.value),
)

const missing = computed(
  () => patientsStore.ready && !isNew.value && patientId.value !== null && patient.value === null,
)

onMounted(() => {
  void patientsStore.refresh()
})

watch(
  [() => patientsStore.ready, patientId, isNew],
  () => {
    if (isNew.value) {
      if (loadedFor.value === 'new') return
      loadedFor.value = 'new'
      code.value = ''
      ageYears.value = ''
      sex.value = ''
      notes.value = ''
      return
    }
    const id = patientId.value
    const current = patient.value
    if (!patientsStore.ready || id === null || current === null || loadedFor.value === id) return
    loadedFor.value = id
    code.value = current.code
    ageYears.value = current.ageYears === null ? '' : String(current.ageYears)
    sex.value = current.sex
    notes.value = current.notes
  },
  { immediate: true },
)

function onSex(value: string) {
  sex.value = value === 'male' || value === 'female' ? value : ''
  saved.value = false
}

function resultLabel(snapshot: CalculatorSnapshot): string {
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

async function save() {
  saved.value = false
  ageError.value = false
  const id = await patientsStore.savePatient(isNew.value ? null : patientId.value, {
    code: code.value,
    ageYears: ageYears.value,
    sex: sex.value,
    notes: notes.value,
  })
  if (id === null) {
    ageError.value = true
    return
  }
  saved.value = true
  if (isNew.value) {
    loadedFor.value = id
    await router.replace({ name: 'patient', params: { id } })
  }
}

async function remove() {
  const id = patientId.value
  if (id === null) return
  await patientsStore.removePatient(id)
  await router.replace({ name: 'patients' })
}
</script>

<template>
  <AppScreen>
    <RouterLink
      :to="{ name: 'patients' }"
      class="inline-flex min-h-11 items-center text-sm font-semibold text-accent"
    >
      {{ t('patients.back') }}
    </RouterLink>
    <h1 class="mt-2 text-[2rem] leading-tight font-semibold text-ink">
      {{ isNew ? t('patients.create') : t('patients.card') }}
    </h1>
    <p v-if="missing" class="mt-4 text-sm text-muted">{{ t('patients.missing') }}</p>
    <form v-else class="mt-6 flex flex-col gap-4" @submit.prevent="save">
      <label class="block">
        <span class="text-sm font-semibold text-ink">{{ t('patients.code') }}</span>
        <input
          v-model="code"
          class="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-3 text-base text-ink"
          autocomplete="off"
          @input="saved = false"
        />
        <span class="mt-1 block text-sm leading-relaxed text-muted">{{
          t('patients.codeHint')
        }}</span>
      </label>
      <label class="block">
        <span class="text-sm font-semibold text-ink">{{ t('calculators.age') }}</span>
        <input
          v-model="ageYears"
          class="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-3 text-base text-ink"
          inputmode="numeric"
          autocomplete="off"
          @input="saved = false"
        />
        <span v-if="ageError" class="mt-1 block text-sm text-danger">{{
          t('patients.ageError')
        }}</span>
      </label>
      <RadioGroup
        :legend="t('patients.sex')"
        name="patient-sex"
        :model-value="sex"
        :options="sexOptions"
        @update:model-value="onSex"
      />
      <label class="block">
        <span class="text-sm font-semibold text-ink">{{ t('patients.notes') }}</span>
        <textarea
          v-model="notes"
          class="mt-2 min-h-28 w-full rounded-xl border border-line bg-surface px-3 py-3 text-base text-ink"
          @input="saved = false"
        />
      </label>
      <button
        type="submit"
        class="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-accent px-4 text-base font-semibold text-on-accent"
      >
        {{ t('patients.save') }}
      </button>
      <p v-if="saved" class="text-sm text-muted" role="status">{{ t('patients.saved') }}</p>
    </form>
    <section v-if="!isNew && patient" class="mt-8">
      <h2 class="text-sm font-semibold text-ink">{{ t('patients.results') }}</h2>
      <p v-if="results.length === 0" class="mt-2 text-sm text-muted">
        {{ t('patients.noResults') }}
      </p>
      <ul v-else class="mt-3 flex flex-col gap-2">
        <li
          v-for="result in results"
          :key="result.id"
          class="rounded-xl border border-line bg-surface px-3 py-3"
        >
          <p class="text-base font-semibold text-ink">{{ resultLabel(result.snapshot) }}</p>
          <p class="text-sm text-muted">{{ time(result.createdAt) }}</p>
        </li>
      </ul>
      <button
        v-if="!confirmDelete"
        type="button"
        class="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-danger px-4 text-base font-semibold text-danger"
        @click="confirmDelete = true"
      >
        {{ t('patients.delete') }}
      </button>
      <div v-else class="mt-6 rounded-2xl border border-danger bg-danger-surface px-4 py-4">
        <p class="text-sm leading-relaxed text-ink">{{ t('patients.deleteConfirm') }}</p>
        <button
          type="button"
          class="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-danger px-4 text-base font-semibold text-on-accent"
          @click="remove"
        >
          {{ t('patients.deleteNow') }}
        </button>
        <button
          type="button"
          class="mt-2 inline-flex min-h-12 w-full items-center justify-center rounded-2xl px-4 text-base font-semibold text-ink"
          @click="confirmDelete = false"
        >
          {{ t('patients.cancel') }}
        </button>
      </div>
    </section>
  </AppScreen>
</template>
