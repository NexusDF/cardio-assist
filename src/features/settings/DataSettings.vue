<script setup lang="ts">
import { ref } from 'vue'
import { decryptJson, encryptJson } from '@/features/settings/logic/backup'
import { parseArchive } from '@/features/settings/logic/archive'
import { isPinShape } from '@/features/settings/logic/pin'
import { useAppI18n } from '@/shared/i18n'
import { useCalculatorDraftsStore } from '@/stores/calculator-drafts'
import { usePatientsStore } from '@/stores/patients'
import { usePinStore } from '@/stores/pin'

const { t } = useAppI18n()
const patientsStore = usePatientsStore()
const drafts = useCalculatorDraftsStore()
const pinStore = usePinStore()

const password = ref('')
const backupMessage = ref('')
const backupError = ref('')
const currentPin = ref('')
const nextPin = ref('')
const repeatPin = ref('')
const pinMessage = ref('')
const pinError = ref('')
const confirmDelete = ref(false)
const deleted = ref(false)

function resetBackup() {
  backupMessage.value = ''
  backupError.value = ''
}

async function download() {
  resetBackup()
  if (password.value.length < 8) {
    backupError.value = t('settings.passwordShort')
    return
  }
  const payload = await patientsStore.exportArchive()
  const encrypted = await encryptJson(password.value, JSON.stringify(payload))
  if (encrypted === null) {
    backupError.value = t('settings.backupFailed')
    return
  }
  const url = URL.createObjectURL(new Blob([encrypted], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `cardioassist-${payload.exportedAt.slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
  backupMessage.value = t('settings.exportReady')
}

async function onImport(event: Event) {
  resetBackup()
  const input = event.target
  if (!(input instanceof HTMLInputElement)) return
  const file = input.files?.[0]
  input.value = ''
  if (file === undefined) return
  if (password.value.length < 8) {
    backupError.value = t('settings.passwordShort')
    return
  }
  const plain = await decryptJson(password.value, await file.text())
  const archive = plain === null ? null : parseArchive(plain)
  if (archive === null) {
    backupError.value = t('settings.backupFailed')
    return
  }
  const added = await patientsStore.importArchive(archive)
  backupMessage.value = t('settings.imported', {
    patients: added.patients,
    results: added.results,
    ecgs: added.ecgs,
  })
}

async function savePin() {
  pinMessage.value = ''
  pinError.value = ''
  if (!isPinShape(nextPin.value)) {
    pinError.value = t('settings.pinInvalid')
    return
  }
  if (nextPin.value !== repeatPin.value) {
    pinError.value = t('settings.pinMismatch')
    return
  }
  if (pinStore.configured) {
    const matches = await pinStore.unlock(currentPin.value)
    if (!matches) {
      pinError.value = t('settings.pinWrong')
      return
    }
  }
  const saved = await pinStore.setPin(nextPin.value)
  if (!saved) {
    pinError.value = t('settings.pinInvalid')
    return
  }
  currentPin.value = ''
  nextPin.value = ''
  repeatPin.value = ''
  pinMessage.value = t('settings.pinOn')
}

async function removePin() {
  pinMessage.value = ''
  pinError.value = ''
  const matches = await pinStore.unlock(currentPin.value)
  if (!matches) {
    pinError.value = t('settings.pinWrong')
    return
  }
  pinStore.clearPin()
  currentPin.value = ''
  pinMessage.value = t('settings.pinOff')
}

async function removeEverything() {
  await patientsStore.deleteAll()
  drafts.clear()
  confirmDelete.value = false
  deleted.value = true
}
</script>

<template>
  <section class="mt-8" aria-labelledby="backup-title">
    <h2 id="backup-title" class="text-sm font-semibold text-ink">{{ t('settings.backup') }}</h2>
    <p class="mt-2 text-sm leading-relaxed text-muted">{{ t('settings.backupLead') }}</p>
    <label class="mt-3 block">
      <span class="text-sm font-semibold text-ink">{{ t('settings.password') }}</span>
      <input
        v-model="password"
        class="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-3 text-base text-ink"
        type="password"
        autocomplete="new-password"
        @input="resetBackup"
      />
      <span class="mt-1 block text-sm leading-relaxed text-muted">{{
        t('settings.passwordHint')
      }}</span>
    </label>
    <button
      type="button"
      class="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-accent px-4 text-base font-semibold text-on-accent"
      @click="download"
    >
      {{ t('settings.export') }}
    </button>
    <label
      class="mt-2 inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-2xl border border-line bg-surface px-4 text-base font-semibold text-ink"
    >
      {{ t('settings.import') }}
      <input class="sr-only" type="file" accept="application/json,.json" @change="onImport" />
    </label>
    <p v-if="backupError" class="mt-3 text-sm text-danger" role="status">{{ backupError }}</p>
    <p v-else-if="backupMessage" class="mt-3 text-sm leading-relaxed text-ink" role="status">
      {{ backupMessage }}
    </p>
  </section>

  <section class="mt-8" aria-labelledby="pin-title">
    <h2 id="pin-title" class="text-sm font-semibold text-ink">{{ t('settings.pin') }}</h2>
    <p class="mt-2 text-sm leading-relaxed text-muted">{{ t('settings.pinLead') }}</p>
    <label v-if="pinStore.configured" class="mt-3 block">
      <span class="text-sm font-semibold text-ink">{{ t('settings.pinCurrent') }}</span>
      <input
        v-model="currentPin"
        class="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-3 text-base text-ink"
        type="password"
        inputmode="numeric"
        autocomplete="off"
      />
    </label>
    <label class="mt-3 block">
      <span class="text-sm font-semibold text-ink">{{ t('settings.pinNew') }}</span>
      <input
        v-model="nextPin"
        class="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-3 text-base text-ink"
        type="password"
        inputmode="numeric"
        autocomplete="off"
      />
    </label>
    <label class="mt-3 block">
      <span class="text-sm font-semibold text-ink">{{ t('settings.pinRepeat') }}</span>
      <input
        v-model="repeatPin"
        class="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-3 text-base text-ink"
        type="password"
        inputmode="numeric"
        autocomplete="off"
      />
    </label>
    <button
      type="button"
      class="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-accent px-4 text-base font-semibold text-on-accent"
      @click="savePin"
    >
      {{ pinStore.configured ? t('settings.pinChange') : t('settings.pinSave') }}
    </button>
    <button
      v-if="pinStore.configured"
      type="button"
      class="mt-2 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-line bg-surface px-4 text-base font-semibold text-ink"
      @click="removePin"
    >
      {{ t('settings.pinRemove') }}
    </button>
    <p v-if="pinError" class="mt-3 text-sm text-danger" role="status">{{ pinError }}</p>
    <p v-else-if="pinMessage" class="mt-3 text-sm text-ink" role="status">{{ pinMessage }}</p>
  </section>

  <section class="mt-8">
    <button
      v-if="!confirmDelete"
      type="button"
      class="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-danger px-4 text-base font-semibold text-danger"
      @click="confirmDelete = true"
    >
      {{ t('settings.deleteAll') }}
    </button>
    <div v-else class="rounded-2xl border border-danger bg-danger-surface px-4 py-4">
      <p class="text-sm leading-relaxed text-ink">{{ t('settings.deleteAllConfirm') }}</p>
      <button
        type="button"
        class="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-danger px-4 text-base font-semibold text-on-accent"
        @click="removeEverything"
      >
        {{ t('settings.deleteAllNow') }}
      </button>
      <button
        type="button"
        class="mt-2 inline-flex min-h-12 w-full items-center justify-center rounded-2xl px-4 text-base font-semibold text-ink"
        @click="confirmDelete = false"
      >
        {{ t('patients.cancel') }}
      </button>
    </div>
    <p v-if="deleted" class="mt-3 text-sm text-ink" role="status">
      {{ t('settings.deleteAllDone') }}
    </p>
  </section>
</template>
