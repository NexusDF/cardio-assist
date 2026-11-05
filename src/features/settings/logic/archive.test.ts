import { describe, expect, it } from 'vitest'
import { mergeArchive, parseArchive, type ArchivePayload } from './archive'

const incoming: ArchivePayload = {
  exportedAt: '2026-11-05T12:00:00.000Z',
  patients: [
    {
      id: 'p1',
      code: '14',
      ageYears: 70,
      sex: 'female',
      notes: '',
      createdAt: '2026-11-05T10:00:00.000Z',
      updatedAt: '2026-11-05T10:00:00.000Z',
    },
    {
      id: 'p2',
      code: '',
      ageYears: null,
      sex: '',
      notes: '',
      createdAt: '2026-11-05T11:00:00.000Z',
      updatedAt: '2026-11-05T11:00:00.000Z',
    },
  ],
  results: [],
  ecgs: [],
}

describe('parseArchive', () => {
  it('drops a result whose patient is missing', () => {
    const parsed = parseArchive(
      JSON.stringify({
        patients: incoming.patients.slice(0, 1),
        results: [
          {
            id: 'r1',
            patientId: 'missing',
            createdAt: '2026-11-05T10:00:00.000Z',
            snapshot: { calculator: 'has-bled', score: 1, maxScore: 9 },
          },
        ],
      }),
    )
    expect(parsed?.patients).toHaveLength(1)
    expect(parsed?.results).toHaveLength(0)
  })
})

describe('mergeArchive', () => {
  it('adds only cards that are not already stored', () => {
    const existing = incoming.patients[0]
    expect(existing).toBeDefined()
    const merged = mergeArchive(existing === undefined ? [] : [existing], [], [], incoming)
    expect(merged.patients.map((patient) => patient.id)).toEqual(['p1', 'p2'])
    expect(merged.added).toEqual({ patients: 1, results: 0, ecgs: 0 })
  })
})
