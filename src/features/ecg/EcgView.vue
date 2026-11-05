<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import NumberField from '@/features/calculators/components/NumberField.vue'
import RadioGroup from '@/features/calculators/components/RadioGroup.vue'
import EcgStage from '@/features/ecg/components/EcgStage.vue'
import {
  distancePx,
  heartRateFromRrMs,
  intervalMs,
  pixelsPerMillisecond,
  qtcFromIntervals,
  scaledPhotoSize,
  smallSquareMsByPaperSpeed,
} from '@/features/ecg/logic/measure'
import { parsePositiveNumber } from '@/features/calculators/logic/parse'
import type { QtcBand, Sex } from '@/features/calculators/logic/qtc'
import AppScreen from '@/shared/components/AppScreen.vue'
import { useAppI18n } from '@/shared/i18n'
import { usePatientsStore } from '@/stores/patients'

type Tool = 'calibration' | 'rr' | 'pr' | 'qrs' | 'qt'

const tools: readonly Tool[] = ['calibration', 'rr', 'pr', 'qrs', 'qt']

const { t } = useAppI18n()
const patientsStore = usePatientsStore()
const image = ref<HTMLImageElement | null>(null)
const photo = ref<Blob | null>(null)
const error = ref('')
const tool = ref<Tool>('calibration')
const knownMs = ref(String(smallSquareMsByPaperSpeed[25]))
const sex = ref<Sex | ''>('')
const open = ref(false)
const saving = ref(false)
const savedPatientId = ref<string | null>(null)
const marks = reactive<Record<Tool, [number, number]>>({
  calibration: [0, 1],
  rr: [0, 1],
  pr: [0, 1],
  qrs: [0, 1],
  qt: [0, 1],
})
let displayUrl = ''

const sexOptions = computed(() => [
  { value: '', label: t('ecg.unspecified') },
  { value: 'male', label: t('calculators.qtc.male') },
  { value: 'female', label: t('calculators.qtc.female') },
])

const pxPerMs = computed(() => {
  const known = parsePositiveNumber(knownMs.value)
  if (known === null) return null
  return pixelsPerMillisecond(distancePx(marks.calibration[0], marks.calibration[1]), known)
})

const intervals = computed(() => {
  const scale = pxPerMs.value
  const read = (name: Exclude<Tool, 'calibration'>) =>
    scale === null ? null : intervalMs(distancePx(marks[name][0], marks[name][1]), scale)
  return {
    rrMs: read('rr'),
    prMs: read('pr'),
    qrsMs: read('qrs'),
    qtMs: read('qt'),
  }
})

const heartRate = computed(() =>
  intervals.value.rrMs === null ? null : heartRateFromRrMs(intervals.value.rrMs),
)

const resultRows = computed(() => {
  const duration = (value: number | null) => (value === null ? '—' : t('ecg.ms', { value }))
  const rate = heartRate.value
  return [
    {
      id: 'calibration',
      label: t('ecg.calibration'),
      value: duration(parsePositiveNumber(knownMs.value)),
      missing: false,
    },
    {
      id: 'rr',
      label: t('ecg.rr'),
      value: duration(intervals.value.rrMs),
      missing: intervals.value.rrMs === null,
    },
    {
      id: 'hr',
      label: t('ecg.heartRate'),
      value: rate === null ? '—' : t('ecg.perMinute', { value: rate }),
      missing: rate === null,
    },
    {
      id: 'pr',
      label: t('ecg.pr'),
      value: duration(intervals.value.prMs),
      missing: intervals.value.prMs === null,
    },
    {
      id: 'qrs',
      label: t('ecg.qrs'),
      value: duration(intervals.value.qrsMs),
      missing: intervals.value.qrsMs === null,
    },
    {
      id: 'qt',
      label: t('ecg.qt'),
      value: duration(intervals.value.qtMs),
      missing: intervals.value.qtMs === null,
    },
  ]
})
const qtc = computed(() => qtcFromIntervals(intervals.value.qtMs, intervals.value.rrMs, sex.value))
const savedPatient = computed(
  () => patientsStore.patients.find((patient) => patient.id === savedPatientId.value) ?? null,
)

function toolLabel(name: Tool): string {
  return t(`ecg.${name}`)
}

function bandLabel(band: QtcBand): string {
  if (band === 'high') return t('calculators.qtc.bands.high')
  if (band === 'prolonged') return t('calculators.qtc.bands.prolonged')
  return t('calculators.qtc.bands.normal')
}

function onMarks(next: [number, number]) {
  marks[tool.value] = next
}

function onSex(value: string) {
  sex.value = value === 'male' || value === 'female' ? value : ''
  savedPatientId.value = null
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const element = new Image()
    element.onload = () => resolve(element)
    element.onerror = () => reject(new Error('image'))
    element.src = src
  })
}

async function onFile(event: Event) {
  const input = event.target
  if (!(input instanceof HTMLInputElement)) return
  const file = input.files?.[0]
  input.value = ''
  if (file === undefined) return
  error.value = ''
  const sourceUrl = URL.createObjectURL(file)
  try {
    const source = await loadHtmlImage(sourceUrl)
    const size = scaledPhotoSize(source.naturalWidth, source.naturalHeight)
    if (size === null) {
      error.value = t('ecg.unreadable')
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = size.width
    canvas.height = size.height
    const ctx = canvas.getContext('2d')
    if (ctx === null) {
      error.value = t('ecg.unreadable')
      return
    }
    ctx.drawImage(source, 0, 0, size.width, size.height)
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.9),
    )
    if (blob === null) {
      error.value = t('ecg.unreadable')
      return
    }
    if (displayUrl !== '') URL.revokeObjectURL(displayUrl)
    displayUrl = URL.createObjectURL(blob)
    const shown = await loadHtmlImage(displayUrl)
    photo.value = blob
    image.value = shown
    const width = shown.naturalWidth
    const span = Math.max(24, width * 0.12)
    const at = (startRatio: number): [number, number] => {
      const start = width * startRatio
      return [start, Math.min(width, start + span)]
    }
    marks.calibration = at(0.12)
    marks.rr = at(0.28)
    marks.pr = at(0.44)
    marks.qrs = at(0.58)
    marks.qt = at(0.72)
    tool.value = 'calibration'
    savedPatientId.value = null
    open.value = false
    void patientsStore.refresh()
  } catch {
    error.value = t('ecg.unreadable')
  } finally {
    URL.revokeObjectURL(sourceUrl)
  }
}

function patientLabel(code: string): string {
  return code === '' ? t('patients.untitled') : code
}

async function saveTo(patientId: string) {
  if (photo.value === null || saving.value) return
  saving.value = true
  try {
    const id = await patientsStore.saveEcg(
      patientId,
      photo.value,
      pxPerMs.value,
      intervals.value,
      sex.value,
    )
    if (id !== null) {
      await patientsStore.adoptSex(patientId, sex.value)
      savedPatientId.value = patientId
      open.value = false
    }
  } finally {
    saving.value = false
  }
}

async function createAndSave() {
  if (photo.value === null || saving.value) return
  saving.value = true
  try {
    const patientId = await patientsStore.savePatient(null, {
      code: '',
      ageYears: '',
      sex: sex.value,
      notes: '',
    })
    if (patientId === null) return
    const id = await patientsStore.saveEcg(
      patientId,
      photo.value,
      pxPerMs.value,
      intervals.value,
      sex.value,
    )
    if (id !== null) {
      savedPatientId.value = patientId
      open.value = false
    }
  } finally {
    saving.value = false
  }
}

onBeforeUnmount(() => {
  if (displayUrl !== '') URL.revokeObjectURL(displayUrl)
})
</script>

<template>
  <AppScreen>
    <h1 class="text-[2rem] leading-tight font-semibold text-ink">{{ t('ecg.title') }}</h1>
    <p class="mt-3 text-base leading-relaxed text-muted">{{ t('ecg.lead') }}</p>
    <div class="mt-6 grid grid-cols-2 gap-2">
      <label
        class="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-2xl bg-accent px-3 text-center text-base font-semibold text-on-accent"
      >
        {{ image ? t('ecg.replace') : t('ecg.camera') }}
        <input
          class="sr-only"
          type="file"
          accept="image/*"
          capture="environment"
          @change="onFile"
        />
      </label>
      <label
        class="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border border-line bg-surface px-3 text-center text-base font-semibold text-ink"
      >
        {{ t('ecg.gallery') }}
        <input class="sr-only" type="file" accept="image/*" @change="onFile" />
      </label>
    </div>
    <p v-if="error" class="mt-3 text-sm text-danger" role="status">{{ error }}</p>
    <template v-if="image">
      <div class="mt-4 flex flex-wrap gap-2" role="group" :aria-label="t('ecg.tools')">
        <button
          v-for="name in tools"
          :key="name"
          type="button"
          class="inline-flex min-h-11 items-center rounded-full border px-3 text-sm font-semibold"
          :class="
            tool === name
              ? 'border-accent bg-accent text-on-accent'
              : 'border-line bg-surface text-ink'
          "
          :aria-pressed="tool === name"
          @click="tool = name"
        >
          {{ toolLabel(name) }}
        </button>
      </div>
      <p class="mt-3 text-sm leading-relaxed text-muted">{{ t('ecg.drag') }}</p>
      <div class="mt-3">
        <EcgStage :image="image" :marks="marks[tool]" @update:marks="onMarks" />
      </div>
      <div v-if="tool === 'calibration'" class="mt-5">
        <NumberField v-model="knownMs" :label="t('ecg.known')" :hint="t('ecg.knownHint')" />
        <div class="mt-3 flex flex-col gap-2">
          <button
            type="button"
            class="inline-flex min-h-12 items-center justify-center rounded-xl border border-line bg-surface px-3 text-base font-semibold text-ink"
            @click="knownMs = String(smallSquareMsByPaperSpeed[25])"
          >
            {{ t('ecg.speed25') }}
          </button>
          <button
            type="button"
            class="inline-flex min-h-12 items-center justify-center rounded-xl border border-line bg-surface px-3 text-base font-semibold text-ink"
            @click="knownMs = String(smallSquareMsByPaperSpeed[50])"
          >
            {{ t('ecg.speed50') }}
          </button>
        </div>
        <p class="mt-3 text-sm leading-relaxed text-muted">{{ t('ecg.paper') }}</p>
      </div>
      <section class="mt-6 rounded-2xl border border-line bg-surface px-4 py-4" aria-live="polite">
        <h2 class="text-sm font-semibold text-ink">{{ t('calculators.result') }}</h2>
        <p v-if="pxPerMs === null" class="mt-2 text-sm leading-relaxed text-muted">
          {{ t('ecg.needScale') }}
        </p>
        <dl v-else class="mt-3 flex flex-col gap-2.5">
          <div v-for="row in resultRows" :key="row.id" class="flex items-center gap-3">
            <dt
              class="shrink-0 text-lg font-semibold"
              :class="row.id === tool ? 'text-accent' : 'text-muted'"
            >
              {{ row.label }}
            </dt>
            <span
              class="h-0.5 min-w-4 flex-1 self-center bg-[repeating-linear-gradient(to_right,var(--line)_0_6px,transparent_6px_11px)]"
              aria-hidden="true"
            />
            <dd
              class="shrink-0 text-base tabular-nums"
              :class="row.missing ? 'text-muted' : 'font-semibold text-ink'"
            >
              {{ row.value }}
            </dd>
          </div>
        </dl>
      </section>
      <div class="mt-5">
        <RadioGroup
          :legend="t('ecg.sex')"
          name="ecg-sex"
          :model-value="sex"
          :options="sexOptions"
          @update:model-value="onSex"
        />
        <p class="mt-2 text-sm leading-relaxed text-muted">{{ t('ecg.sexHint') }}</p>
      </div>
      <ul v-if="qtc" class="mt-4 flex flex-col gap-2">
        <li
          v-for="formula in qtc.formulas"
          :key="formula.id"
          class="rounded-2xl border border-line bg-surface px-4 py-3"
        >
          <p class="text-sm text-muted">{{ t(`calculators.qtc.formulas.${formula.id}`) }}</p>
          <p class="mt-1 text-2xl font-semibold text-ink">
            {{ formula.qtcMs }} {{ t('calculators.qtc.ms') }}
          </p>
          <p class="mt-1 text-sm font-semibold text-ink">{{ bandLabel(formula.band) }}</p>
          <p
            v-if="formula.id === 'bazett' && qtc.bazettTachycardiaWarning"
            class="mt-2 text-sm leading-relaxed text-warn"
          >
            {{ t('calculators.qtc.bazettWarning') }}
          </p>
        </li>
      </ul>
      <button
        type="button"
        class="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-accent px-4 text-base font-semibold text-on-accent"
        @click="open = !open"
      >
        {{ t('ecg.save') }}
      </button>
      <section v-if="open" class="mt-3 rounded-2xl border border-line bg-surface px-4 py-4">
        <h2 class="text-sm font-semibold text-ink">{{ t('calculators.chooseCard') }}</h2>
        <ul v-if="patientsStore.patients.length > 0" class="mt-3 flex flex-col gap-2">
          <li v-for="patient in patientsStore.patients" :key="patient.id">
            <button
              type="button"
              class="inline-flex min-h-12 w-full items-center rounded-xl border border-line bg-paper px-3 text-left text-base font-semibold text-ink"
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
  </AppScreen>
</template>
