import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  appendDraft,
  calculatorDraftStorageKey,
  parseDrafts,
  removeDraft,
  serializeDrafts,
  type CalculatorDraft,
  type CalculatorSnapshot,
} from '@/features/calculators/logic/drafts'

export const useCalculatorDraftsStore = defineStore('calculator-drafts', () => {
  const drafts = ref<CalculatorDraft[]>(parseDrafts(readRaw()))

  function save(snapshot: CalculatorSnapshot, now = new Date()): string {
    const id = crypto.randomUUID()
    drafts.value = appendDraft(drafts.value, {
      id,
      createdAt: now.toISOString(),
      snapshot,
    })
    persist()
    return id
  }

  function remove(id: string) {
    drafts.value = removeDraft(drafts.value, id)
    persist()
  }

  function persist() {
    localStorage.setItem(calculatorDraftStorageKey, serializeDrafts(drafts.value))
  }

  return { drafts, save, remove }
})

function readRaw(): string | null {
  try {
    return localStorage.getItem(calculatorDraftStorageKey)
  } catch {
    return null
  }
}
