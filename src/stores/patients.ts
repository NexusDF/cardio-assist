import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { CalculatorSnapshot } from '@/features/calculators/logic/drafts'
import { db } from '@/features/patients/db'
import {
  normalizePatient,
  type PatientInput,
  type PatientRecord,
  type PatientSex,
} from '@/features/patients/logic/patients'
import type { EcgIntervalsRecord, EcgRecord, ScaleResultRecord } from '@/features/patients/db'
import {
  mergeArchive,
  serializeEcg,
  type ArchiveCounts,
  type ArchivePayload,
} from '@/features/settings/logic/archive'

export const usePatientsStore = defineStore('patients', () => {
  const patients = ref<PatientRecord[]>([])
  const results = ref<ScaleResultRecord[]>([])
  const ecgs = ref<EcgRecord[]>([])
  const ready = ref(false)

  async function refresh(): Promise<void> {
    const [nextPatients, nextResults, nextEcgs] = await Promise.all([
      db.patients.toArray(),
      db.results.toArray(),
      db.ecgs.toArray(),
    ])
    patients.value = [...nextPatients].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    results.value = [...nextResults].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    ecgs.value = [...nextEcgs].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
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

  async function adoptSex(patientId: string, sex: PatientSex): Promise<void> {
    if (sex === '') return
    const existing = await db.patients.get(patientId)
    if (existing === undefined || existing.sex !== '') return
    await db.patients.update(patientId, { sex })
    await refresh()
  }

  async function removePatient(id: string): Promise<void> {
    await db.transaction('rw', db.patients, db.results, db.ecgs, async () => {
      await db.results.where('patientId').equals(id).delete()
      await db.ecgs.where('patientId').equals(id).delete()
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

  async function saveEcg(
    patientId: string,
    image: Blob,
    pxPerMs: number | null,
    intervals: EcgIntervalsRecord,
    sex: EcgRecord['sex'],
    now = new Date(),
  ): Promise<string | null> {
    const existing = await db.patients.get(patientId)
    if (existing === undefined) return null
    const createdAt = now.toISOString()
    const record: EcgRecord = {
      id: crypto.randomUUID(),
      patientId,
      createdAt,
      image,
      pxPerMs,
      intervals: {
        rrMs: intervals.rrMs,
        prMs: intervals.prMs,
        qrsMs: intervals.qrsMs,
        qtMs: intervals.qtMs,
      },
      sex,
    }
    await db.transaction('rw', db.patients, db.ecgs, async () => {
      await db.ecgs.add(record)
      await db.patients.update(patientId, { updatedAt: createdAt })
    })
    await refresh()
    return record.id
  }

  async function exportArchive(now = new Date()): Promise<ArchivePayload> {
    const [storedPatients, storedResults, storedEcgs] = await Promise.all([
      db.patients.toArray(),
      db.results.toArray(),
      db.ecgs.toArray(),
    ])
    return {
      exportedAt: now.toISOString(),
      patients: storedPatients,
      results: storedResults,
      ecgs: await Promise.all(storedEcgs.map((record) => serializeEcg(record))),
    }
  }

  async function importArchive(incoming: ArchivePayload): Promise<ArchiveCounts> {
    const [storedPatients, storedResults, storedEcgs] = await Promise.all([
      db.patients.toArray(),
      db.results.toArray(),
      db.ecgs.toArray(),
    ])
    const merged = mergeArchive(storedPatients, storedResults, storedEcgs, incoming)
    const patientIds = new Set(storedPatients.map((patient) => patient.id))
    const resultIds = new Set(storedResults.map((result) => result.id))
    const ecgIds = new Set(storedEcgs.map((record) => record.id))
    await db.transaction('rw', db.patients, db.results, db.ecgs, async () => {
      await db.patients.bulkAdd(merged.patients.filter((patient) => !patientIds.has(patient.id)))
      await db.results.bulkAdd(merged.results.filter((result) => !resultIds.has(result.id)))
      await db.ecgs.bulkAdd(merged.ecgs.filter((record) => !ecgIds.has(record.id)))
    })
    await refresh()
    return merged.added
  }

  async function deleteAll(): Promise<void> {
    await db.transaction('rw', db.patients, db.results, db.ecgs, async () => {
      await db.patients.clear()
      await db.results.clear()
      await db.ecgs.clear()
    })
    await refresh()
  }

  async function removeEcg(id: string): Promise<void> {
    const existing = await db.ecgs.get(id)
    if (existing === undefined) return
    await db.transaction('rw', db.patients, db.ecgs, async () => {
      await db.ecgs.delete(id)
      await db.patients.update(existing.patientId, { updatedAt: new Date().toISOString() })
    })
    await refresh()
  }

  return {
    patients,
    results,
    ecgs,
    ready,
    refresh,
    savePatient,
    adoptSex,
    removePatient,
    saveResult,
    saveEcg,
    removeEcg,
    exportArchive,
    importArchive,
    deleteAll,
  }
})

function cloneSnapshot(snapshot: CalculatorSnapshot): CalculatorSnapshot {
  return JSON.parse(JSON.stringify(snapshot)) as CalculatorSnapshot
}
