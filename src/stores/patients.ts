import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { CalculatorSnapshot } from '@/features/calculators/logic/drafts'
import { db } from '@/features/patients/db'
import {
  normalizePatient,
  type PatientInput,
  type PatientRecord,
} from '@/features/patients/logic/patients'
import type { ScaleResultRecord } from '@/features/patients/db'

export const usePatientsStore = defineStore('patients', () => {
  const patients = ref<PatientRecord[]>([])
  const results = ref<ScaleResultRecord[]>([])
  const ready = ref(false)

  async function refresh(): Promise<void> {
    const [nextPatients, nextResults] = await Promise.all([
      db.patients.toArray(),
      db.results.toArray(),
    ])
    patients.value = [...nextPatients].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    results.value = [...nextResults].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    ready.value = true
  }

  async function savePatient(
    id: string | null,
    input: PatientInput,
    now = new Date(),
  ): Promise<string | null> {
    const normalized = normalizePatient(input)
    if (normalized === null) return null
    const timestamp = now.toISOString()
    if (id === null) {
      const created: PatientRecord = {
        id: crypto.randomUUID(),
        ...normalized,
        createdAt: timestamp,
        updatedAt: timestamp,
      }
      await db.patients.add(created)
      await refresh()
      return created.id
    }
    const existing = await db.patients.get(id)
    if (existing === undefined) return null
    await db.patients.update(id, { ...normalized, updatedAt: timestamp })
    await refresh()
    return id
  }

  async function removePatient(id: string): Promise<void> {
    await db.transaction('rw', db.patients, db.results, async () => {
      await db.results.where('patientId').equals(id).delete()
      await db.patients.delete(id)
    })
    await refresh()
  }

  async function saveResult(
    patientId: string,
    snapshot: CalculatorSnapshot,
    now = new Date(),
  ): Promise<string | null> {
    const existing = await db.patients.get(patientId)
    if (existing === undefined) return null
    const createdAt = now.toISOString()
    const record: ScaleResultRecord = {
      id: crypto.randomUUID(),
      patientId,
      createdAt,
      snapshot: cloneSnapshot(snapshot),
    }
    await db.transaction('rw', db.patients, db.results, async () => {
      await db.results.add(record)
      await db.patients.update(patientId, { updatedAt: createdAt })
    })
    await refresh()
    return record.id
  }

  return { patients, results, ready, refresh, savePatient, removePatient, saveResult }
})

function cloneSnapshot(snapshot: CalculatorSnapshot): CalculatorSnapshot {
  return JSON.parse(JSON.stringify(snapshot)) as CalculatorSnapshot
}
