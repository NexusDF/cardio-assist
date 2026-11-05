import { parseAgeYears } from '@/features/calculators/logic/parse'

export type PatientSex = '' | 'male' | 'female'
export type PatientSexFilter = 'all' | 'male' | 'female'

export interface PatientRecord {
  readonly id: string
  readonly code: string
  readonly ageYears: number | null
  readonly sex: PatientSex
  readonly notes: string
  readonly createdAt: string
  readonly updatedAt: string
}

export interface PatientInput {
  readonly code: string
  readonly ageYears: string
  readonly sex: PatientSex
  readonly notes: string
}

export interface NormalizedPatient {
  readonly code: string
  readonly ageYears: number | null
  readonly sex: PatientSex
  readonly notes: string
}

export function normalizePatient(input: PatientInput): NormalizedPatient | null {
  const ageRaw = input.ageYears.trim()
  const ageYears = ageRaw === '' ? null : parseAgeYears(ageRaw)
  if (ageRaw !== '' && ageYears === null) return null
  if (input.sex !== '' && input.sex !== 'male' && input.sex !== 'female') return null
  return {
    code: input.code.trim(),
    ageYears,
    sex: input.sex,
    notes: input.notes.trim(),
  }
}

export function filterPatients(
  patients: readonly PatientRecord[],
  query: string,
  sex: PatientSexFilter,
): PatientRecord[] {
  const needle = query.trim().toLocaleLowerCase('ru-RU')
  return patients.filter((patient) => {
    if (sex !== 'all' && patient.sex !== sex) return false
    if (needle === '') return true
    const haystack = `${patient.code}\n${patient.notes}`.toLocaleLowerCase('ru-RU')
    return haystack.includes(needle)
  })
}
