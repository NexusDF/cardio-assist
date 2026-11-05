<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppScreen from '@/shared/components/AppScreen.vue'
import { useAppI18n } from '@/shared/i18n'
import { usePatientsStore } from '@/stores/patients'
import { filterPatients, type PatientSexFilter } from '@/features/patients/logic/patients'

const { t } = useAppI18n()
const patientsStore = usePatientsStore()
const query = ref('')
const sex = ref<PatientSexFilter>('all')

onMounted(() => {
  void patientsStore.refresh()
})

const visible = computed(() => filterPatients(patientsStore.patients, query.value, sex.value))

const filters: readonly PatientSexFilter[] = ['all', 'female', 'male']

function filterLabel(value: PatientSexFilter): string {
  if (value === 'female') return t('patients.sexFemale')
  if (value === 'male') return t('patients.sexMale')
  return t('patients.sexAll')
}

function title(code: string): string {
  return code === '' ? t('patients.untitled') : code
}

function details(ageYears: number | null, sexValue: '' | 'male' | 'female'): string {
  const parts: string[] = []
  if (ageYears !== null) parts.push(t('patients.ageValue', { age: ageYears }))
  if (sexValue === 'male') parts.push(t('patients.sexMale'))
  if (sexValue === 'female') parts.push(t('patients.sexFemale'))
  return parts.join(' · ')
}
</script>

<template>
  <AppScreen>
    <div class="flex items-start justify-between gap-3">
      <h1 class="text-[2rem] leading-tight font-semibold text-ink">{{ t('patients.title') }}</h1>
    </div>
    <p class="mt-3 text-base leading-relaxed text-muted">{{ t('patients.lead') }}</p>
    <label class="mt-6 block">
      <span class="text-sm font-semibold text-ink">{{ t('patients.search') }}</span>
      <input
        v-model="query"
        class="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-3 text-base text-ink placeholder:text-muted"
        type="search"
        autocomplete="off"
        :placeholder="t('patients.searchPlaceholder')"
      />
    </label>
    <div class="mt-3 flex flex-wrap gap-2" role="group" :aria-label="t('patients.filter')">
      <button
        v-for="option in filters"
        :key="option"
        type="button"
        class="inline-flex min-h-11 items-center rounded-full border px-3 text-sm font-semibold"
        :class="
          sex === option
            ? 'border-accent bg-accent text-on-accent'
            : 'border-line bg-surface text-ink'
        "
        :aria-pressed="sex === option"
        @click="sex = option"
      >
        {{ filterLabel(option) }}
      </button>
    </div>
    <RouterLink
      :to="{ name: 'patient-new' }"
      class="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-accent px-4 text-base font-semibold text-on-accent"
    >
      {{ t('patients.create') }}
    </RouterLink>
    <p v-if="patientsStore.ready && visible.length === 0" class="mt-6 text-sm text-muted">
      {{ query.trim() === '' && sex === 'all' ? t('patients.empty') : t('patients.noMatches') }}
    </p>
    <ul v-else class="mt-4 flex flex-col gap-2">
      <li v-for="patient in visible" :key="patient.id">
        <RouterLink
          :to="{ name: 'patient', params: { id: patient.id } }"
          class="flex min-h-16 flex-col justify-center rounded-2xl border border-line bg-surface px-4 py-3"
        >
          <span class="text-base font-semibold text-ink">{{ title(patient.code) }}</span>
          <span v-if="details(patient.ageYears, patient.sex)" class="text-sm text-muted">
            {{ details(patient.ageYears, patient.sex) }}
          </span>
        </RouterLink>
      </li>
    </ul>
  </AppScreen>
</template>
