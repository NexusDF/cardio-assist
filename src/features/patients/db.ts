import Dexie, { type EntityTable } from 'dexie'
import type { CalculatorSnapshot } from '@/features/calculators/logic/drafts'
import type { PatientRecord } from '@/features/patients/logic/patients'

export interface ScaleResultRecord {
  readonly id: string
  readonly patientId: string
  readonly createdAt: string
  readonly snapshot: CalculatorSnapshot
}

export interface EcgIntervalsRecord {
  readonly rrMs: number | null
  readonly prMs: number | null
  readonly qrsMs: number | null
  readonly qtMs: number | null
}

export interface EcgRecord {
  readonly id: string
  readonly patientId: string
  readonly createdAt: string
  readonly image: Blob
  readonly pxPerMs: number | null
  readonly intervals: EcgIntervalsRecord
  readonly sex: '' | 'male' | 'female'
}

export const db = new Dexie('cardioassist') as Dexie & {
  patients: EntityTable<PatientRecord, 'id'>
  results: EntityTable<ScaleResultRecord, 'id'>
  ecgs: EntityTable<EcgRecord, 'id'>
}

db.version(1).stores({
  patients: 'id, updatedAt',
  results: 'id, patientId, createdAt',
})

db.version(2).stores({
  ecgs: 'id, patientId, createdAt',
})
