import { describe, expect, it } from 'vitest'
import { chartLayout, collectTrends, valueLabelY } from './trends'

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

describe('chartLayout', () => {
  it('draws a scale that contains the values and keeps time left to right', () => {
    const layout = chartLayout(
      [
        { at: '2026-11-05T09:00:00.000Z', value: 90 },
        { at: '2026-11-05T11:00:00.000Z', value: 1500 },
      ],
      360,
      168,
    )
    expect(layout.ticks[0]?.value).toBeLessThanOrEqual(90)
    expect(layout.ticks.at(-1)?.value).toBeGreaterThanOrEqual(1500)
    expect(layout.dots[0]?.x).toBeLessThan(layout.dots[1]?.x ?? 0)
    expect(layout.dots[0]?.y).toBeGreaterThan(layout.dots[1]?.y ?? 0)

    const single = chartLayout([{ at: '2026-11-05T09:00:00.000Z', value: 86 }], 360, 168)
    expect(single.ticks.some((tick) => tick.value <= 86)).toBe(true)
    expect(single.ticks.some((tick) => tick.value >= 86)).toBe(true)
    expect(single.dots[0]?.x).toBe((single.plotLeft + single.plotRight) / 2)
  })

  it('places the last value above the line that reaches it', () => {
    const layout = chartLayout(
      [
        { at: '2026-11-05T09:00:00.000Z', value: 90 },
        { at: '2026-11-05T11:00:00.000Z', value: 1500 },
      ],
      360,
      180,
    )
    const first = layout.dots[0]
    const last = layout.dots[1]
    expect(first).toBeDefined()
    expect(last).toBeDefined()
    if (first === undefined || last === undefined) return
    const labelY = valueLabelY(last.y)
    const labelLeft = last.x - 36
    const progress = (labelLeft - first.x) / (last.x - first.x)
    const lineY = first.y + (last.y - first.y) * progress
    expect(labelY).toBeLessThan(last.y)
    expect(lineY).toBeGreaterThan(labelY + 8)
  })
})
