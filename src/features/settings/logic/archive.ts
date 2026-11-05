import { parseCalculatorSnapshot } from '@/features/calculators/logic/drafts'
import type { PatientRecord, PatientSex } from '@/features/patients/logic/patients'
import type { EcgIntervalsRecord, EcgRecord, ScaleResultRecord } from '@/features/patients/db'

export interface StoredEcg {
  readonly id: string
  readonly patientId: string
  readonly createdAt: string
  readonly pxPerMs: number | null
  readonly intervals: EcgIntervalsRecord
  readonly sex: PatientSex
  readonly imageType: string
  readonly imageBase64: string
}

export interface ArchivePayload {
  readonly exportedAt: string
  readonly patients: PatientRecord[]
  readonly results: ScaleResultRecord[]
  readonly ecgs: StoredEcg[]
}

export interface ArchiveCounts {
  readonly patients: number
  readonly results: number
  readonly ecgs: number
}

export function parseArchive(raw: string): ArchivePayload | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!isRecord(parsed) || !Array.isArray(parsed.patients)) return null
  const patients = parsed.patients.flatMap((item) => {
    const patient = parsePatient(item)
    return patient === null ? [] : [patient]
  })
  const ids = new Set(patients.map((patient) => patient.id))
  const results = Array.isArray(parsed.results)
    ? parsed.results.flatMap((item) => {
        const result = parseResult(item)
        return result !== null && ids.has(result.patientId) ? [result] : []
      })
    : []
  const ecgs = Array.isArray(parsed.ecgs)
    ? parsed.ecgs.flatMap((item) => {
        const ecg = parseEcg(item)
        return ecg !== null && ids.has(ecg.patientId) ? [ecg] : []
      })
    : []
  return {
    exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : '',
    patients,
    results,
    ecgs,
  }
}

export function mergeArchive(
  currentPatients: readonly PatientRecord[],
  currentResults: readonly ScaleResultRecord[],
  currentEcgs: readonly EcgRecord[],
  incoming: ArchivePayload,
): {
  patients: PatientRecord[]
  results: ScaleResultRecord[]
  ecgs: EcgRecord[]
  added: ArchiveCounts
} {
  const patients = mergeById(currentPatients, incoming.patients)
  const patientIds = new Set(patients.map((patient) => patient.id))
  const results = mergeById(
    currentResults,
    incoming.results.filter((result) => patientIds.has(result.patientId)),
  )
  const ecgs = mergeById(
    currentEcgs,
    incoming.ecgs
      .filter((ecg) => patientIds.has(ecg.patientId))
      .map((ecg) => ({
        id: ecg.id,
        patientId: ecg.patientId,
        createdAt: ecg.createdAt,
        pxPerMs: ecg.pxPerMs,
        intervals: ecg.intervals,
        sex: ecg.sex,
        image: base64ToBlob(ecg.imageBase64, ecg.imageType),
      })),
  )
  return {
    patients,
    results,
    ecgs,
    added: {
      patients: patients.length - currentPatients.length,
      results: results.length - currentResults.length,
      ecgs: ecgs.length - currentEcgs.length,
    },
  }
}

export async function serializeEcg(record: EcgRecord): Promise<StoredEcg> {
  return {
    id: record.id,
    patientId: record.patientId,
    createdAt: record.createdAt,
    pxPerMs: record.pxPerMs,
    intervals: record.intervals,
    sex: record.sex,
    imageType: record.image.type || 'image/jpeg',
    imageBase64: await blobToBase64(record.image),
  }
}

function mergeById<T extends { readonly id: string }>(
  current: readonly T[],
  incoming: readonly T[],
): T[] {
  const seen = new Set(current.map((item) => item.id))
  return [...current, ...incoming.filter((item) => !seen.has(item.id))]
}

function parsePatient(value: unknown): PatientRecord | null {
  if (!isRecord(value) || typeof value.id !== 'string' || value.id === '') return null
  if (typeof value.code !== 'string' || typeof value.notes !== 'string') return null
  if (value.sex !== '' && value.sex !== 'male' && value.sex !== 'female') return null
  let ageYears: number | null = null
  if (value.ageYears !== null) {
    if (typeof value.ageYears !== 'number' || !Number.isInteger(value.ageYears)) return null
    ageYears = value.ageYears
  }
  if (typeof value.createdAt !== 'string' || typeof value.updatedAt !== 'string') return null
  return {
    id: value.id,
    code: value.code,
    notes: value.notes,
    sex: value.sex,
    ageYears,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  }
}

function parseResult(value: unknown): ScaleResultRecord | null {
  if (!isRecord(value) || typeof value.id !== 'string' || value.id === '') return null
  if (typeof value.patientId !== 'string' || typeof value.createdAt !== 'string') return null
  const snapshot = parseCalculatorSnapshot(value.snapshot)
  if (snapshot === null) return null
  return {
    id: value.id,
    patientId: value.patientId,
    createdAt: value.createdAt,
    snapshot,
  }
}

function parseEcg(value: unknown): StoredEcg | null {
  if (!isRecord(value) || typeof value.id !== 'string' || value.id === '') return null
  if (typeof value.patientId !== 'string' || typeof value.createdAt !== 'string') return null
  if (typeof value.imageBase64 !== 'string' || typeof value.imageType !== 'string') return null
  if (value.sex !== '' && value.sex !== 'male' && value.sex !== 'female') return null
  if (!isRecord(value.intervals)) return null
  return {
    id: value.id,
    patientId: value.patientId,
    createdAt: value.createdAt,
    pxPerMs: typeof value.pxPerMs === 'number' ? value.pxPerMs : null,
    sex: value.sex,
    imageType: value.imageType,
    imageBase64: value.imageBase64,
    intervals: {
      rrMs: nullableNumber(value.intervals.rrMs),
      prMs: nullableNumber(value.intervals.prMs),
      qrsMs: nullableNumber(value.intervals.qrsMs),
      qtMs: nullableNumber(value.intervals.qtMs),
    },
  }
}

function nullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  let binary = ''
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000))
  }
  return btoa(binary)
}

function base64ToBlob(value: string, type: string): Blob {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return new Blob([bytes], { type })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
