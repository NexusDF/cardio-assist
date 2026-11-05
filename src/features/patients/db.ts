import Dexie, { type EntityTable } from 'dexie'
import type { CalculatorSnapshot } from '@/features/calculators/logic/drafts'
import type { PatientRecord } from '@/features/patients/logic/patients'

export interface ScaleResultRecord {
  readonly id: string
  readonly patientId: string
  readonly createdAt: string
  readonly snapshot: CalculatorSnapshot
}

export const db = new Dexie('cardioassist') as Dexie & {
  patients: EntityTable<PatientRecord, 'id'>
  results: EntityTable<ScaleResultRecord, 'id'>
}

db.version(1).stores({
  patients: 'id, updatedAt',
  results: 'id, patientId, createdAt',
})
