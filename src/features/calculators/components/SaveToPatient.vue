<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { CalculatorSnapshot } from '@/features/calculators/logic/drafts'
import { useAppI18n } from '@/shared/i18n'
import { usePatientsStore } from '@/stores/patients'

const props = defineProps<{
  snapshot: CalculatorSnapshot | null
}>()

const { t } = useAppI18n()
const patientsStore = usePatientsStore()
const open = ref(false)
const savedPatientId = ref<string | null>(null)
const saving = ref(false)

onMounted(() => {
  void patientsStore.refresh()
})

watch(
  () => props.snapshot,
  () => {
    savedPatientId.value = null
    open.value = false
  },
)

const savedPatient = computed(
  () => patientsStore.patients.find((patient) => patient.id === savedPatientId.value) ?? null,
)

function patientLabel(code: string): string {
  return code === '' ? t('patients.untitled') : code
}

async function saveTo(patientId: string) {
  if (props.snapshot === null || saving.value) return
  saving.value = true
  try {
    const id = await patientsStore.saveResult(patientId, props.snapshot)
    if (id !== null) {
      savedPatientId.value = patientId
      open.value = false
    }
  } finally {
    saving.value = false
  }
}

async function createAndSave() {
  if (props.snapshot === null || saving.value) return
  saving.value = true
  try {
    const patientId = await patientsStore.savePatient(null, {
      code: '',
      ageYears: '',
      sex: '',
      notes: '',
    })
    if (patientId === null) return
    const id = await patientsStore.saveResult(patientId, props.snapshot)
    if (id !== null) {
      savedPatientId.value = patientId
      open.value = false
    }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <button
    type="button"
    class="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl px-4 text-base font-semibold"
    :class="snapshot ? 'bg-accent text-on-accent' : 'border border-line bg-surface text-muted'"
    :disabled="snapshot === null"
    @click="open = !open"
  >
    {{ t('calculators.save') }}
  </button>
  <section v-if="open && snapshot" class="mt-3 rounded-2xl border border-line bg-surface px-4 py-4">
    <h2 class="text-sm font-semibold text-ink">{{ t('calculators.chooseCard') }}</h2>
    <ul v-if="patientsStore.patients.length > 0" class="mt-3 flex flex-col gap-2">
      <li v-for="patient in patientsStore.patients" :key="patient.id">
        <button
          type="button"
          class="inline-flex min-h-12 w-full items-center justify-between rounded-xl border border-line bg-paper px-3 text-left text-base font-semibold text-ink"
          :disabled="saving"
          @click="saveTo(patient.id)"
        >
          {{ patientLabel(patient.code) }}
        </button>
      </li>
    </ul>
    <button
      type="button"
      class="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-accent px-3 text-base font-semibold text-accent"
      :disabled="saving"
      @click="createAndSave"
    >
      {{ t('calculators.newCard') }}
    </button>
  </section>
  <p v-if="savedPatient" class="mt-3 text-sm leading-relaxed text-muted" role="status">
    {{
      savedPatient.code === ''
        ? t('calculators.savedUntitled')
        : t('calculators.savedNamed', { code: savedPatient.code })
    }}
    <RouterLink
      class="mt-2 inline-flex min-h-11 items-center font-semibold text-accent"
      :to="{ name: 'patient', params: { id: savedPatient.id } }"
    >
      {{ t('calculators.openCard') }}
    </RouterLink>
  </p>
</template>
