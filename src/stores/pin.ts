import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  createPinRecord,
  parsePinRecord,
  pinMatches,
  pinStorageKey,
  serializePinRecord,
  type PinRecord,
} from '@/features/settings/logic/pin'

export const usePinStore = defineStore('pin', () => {
  const record = ref<PinRecord | null>(parsePinRecord(readRaw()))
  const unlocked = ref(record.value === null)
  const configured = computed(() => record.value !== null)

  async function unlock(pin: string): Promise<boolean> {
    if (record.value === null) {
      unlocked.value = true
      return true
    }
    const matches = await pinMatches(pin, record.value)
    if (matches) unlocked.value = true
    return matches
  }

  async function setPin(pin: string): Promise<boolean> {
    const next = await createPinRecord(pin)
    if (next === null) return false
    record.value = next
    unlocked.value = true
    writeRaw(serializePinRecord(next))
    return true
  }

  function clearPin() {
    record.value = null
    unlocked.value = true
    try {
      localStorage.removeItem(pinStorageKey)
    } catch {
      // The lock is already gone in memory.
    }
  }

  return { configured, unlocked, unlock, setPin, clearPin }
})

function readRaw(): string | null {
  try {
    return localStorage.getItem(pinStorageKey)
  } catch {
    return null
  }
}

function writeRaw(value: string) {
  localStorage.setItem(pinStorageKey, value)
}
