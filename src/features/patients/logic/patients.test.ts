import { describe, expect, it } from 'vitest'
import {
  filterPatients,
  normalizePatient,
  patientSexFromQtc,
  type PatientRecord,
} from './patients'

const patient = (patch: Partial<PatientRecord> & Pick<PatientRecord, 'id'>): PatientRecord => ({
  code: '',
  ageYears: null,
  sex: '',
  notes: '',
  createdAt: '2026-11-05T00:00:00.000Z',
  updatedAt: '2026-11-05T00:00:00.000Z',
  ...patch,
})

describe('normalizePatient', () => {
  it('keeps an empty code and an empty age', () => {
    expect(normalizePatient({ code: '  ', ageYears: '', sex: '', notes: '  ' })).toEqual({
      code: '',
      ageYears: null,
      sex: '',
      notes: '',
    })
  })

  it('accepts age 0 and age 130', () => {
    expect(normalizePatient({ code: '14', ageYears: '0', sex: 'male', notes: 'a' })?.ageYears).toBe(
      0,
    )
    expect(
      normalizePatient({ code: '', ageYears: '130', sex: 'female', notes: '' })?.ageYears,
    ).toBe(130)
  })

  it('rejects an age that is not a whole year in range', () => {
    expect(normalizePatient({ code: '', ageYears: '131', sex: '', notes: '' })).toBeNull()
    expect(normalizePatient({ code: '', ageYears: '75,5', sex: '', notes: '' })).toBeNull()
    expect(normalizePatient({ code: '', ageYears: '-1', sex: '', notes: '' })).toBeNull()
  })
})

describe('patientSexFromQtc', () => {
  it('keeps the sex chosen for QTc and ignores other calculators', () => {
    expect(patientSexFromQtc({ calculator: 'qtc', sex: 'female' })).toBe('female')
    expect(patientSexFromQtc({ calculator: 'qtc', sex: 'male' })).toBe('male')
    expect(patientSexFromQtc({ calculator: 'has-bled' })).toBe('')
    expect(patientSexFromQtc({ calculator: 'qtc', sex: 'other' })).toBe('')
  })
})

describe('filterPatients', () => {
  const patients = [
    patient({ id: 'a', code: '14', notes: 'палата А', sex: 'female' }),
    patient({ id: 'b', code: 'Палата 2', notes: '', sex: 'male' }),
    patient({ id: 'c', code: '', notes: 'без кода', sex: '' }),
  ]

  it('matches code and notes without case', () => {
    expect(filterPatients(patients, 'ПАЛАТ', 'all').map((item) => item.id)).toEqual(['a', 'b'])
    expect(filterPatients(patients, 'без', 'all').map((item) => item.id)).toEqual(['c'])
  })

  it('filters by sex and keeps unspecified cards only in the full list', () => {
    expect(filterPatients(patients, '', 'female').map((item) => item.id)).toEqual(['a'])
    expect(filterPatients(patients, '', 'male').map((item) => item.id)).toEqual(['b'])
    expect(filterPatients(patients, '', 'all')).toHaveLength(3)
  })

  it('combines the query and the sex filter', () => {
    expect(filterPatients(patients, 'палата', 'male').map((item) => item.id)).toEqual(['b'])
  })
})
