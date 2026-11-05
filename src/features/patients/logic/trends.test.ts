import { describe, expect, it } from 'vitest'
import { chartDots, collectTrends } from './trends'

describe('collectTrends', () => {
  it('reads Bazett QTc and heart rate from a saved scale and an ECG', () => {
    const trends = collectTrends(
      [
        {
          createdAt: '2026-11-05T10:00:00.000Z',
          snapshot: {
            calculator: 'qtc',
            sex: 'female',
            qtMs: 400,
            heartRateBpm: 60,
            rrSeconds: 1,
            formulas: [
              { id: 'bazett', qtcMs: 400, band: 'normal' },
              { id: 'hodges', qtcMs: 400, band: 'normal' },
            ],
          },
        },
        {
          createdAt: '2026-11-05T11:00:00.000Z',
          snapshot: { calculator: 'has-bled', score: 1, maxScore: 9 },
        },
      ],
      [
        {
          createdAt: '2026-11-05T09:00:00.000Z',
          intervals: { rrMs: 800, prMs: null, qrsMs: null, qtMs: 400 },
          sex: 'male',
        },
      ],
    )

    expect(trends.qtc.map((point) => point.value)).toEqual([447, 400])
    expect(trends.heartRate.map((point) => point.value)).toEqual([75, 60])
  })
})

describe('chartDots', () => {
  it('places a single point in the middle and a later point to the right', () => {
    const dots = chartDots(
      [
        { at: '2026-11-05T09:00:00.000Z', value: 400 },
        { at: '2026-11-05T11:00:00.000Z', value: 460 },
      ],
      320,
      140,
    )
    expect(dots[0]?.x).toBeLessThan(dots[1]?.x ?? 0)
    expect(dots[0]?.y).toBeGreaterThan(dots[1]?.y ?? 0)
    expect(chartDots([{ at: '2026-11-05T09:00:00.000Z', value: 70 }], 320, 140)[0]?.x).toBe(160)
  })
})
