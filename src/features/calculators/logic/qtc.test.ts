import { describe, expect, it } from 'vitest'
import {
  bazettQtc,
  computeQtc,
  fridericiaQtc,
  framinghamQtc,
  hodgesQtc,
  qtcBand,
  roundMs,
} from './qtc'

describe('формулы QTc', () => {
  it('при RR 1 с и ЧСС 60 совпадает с QT', () => {
    expect(bazettQtc(400, 1)).toBe(400)
    expect(fridericiaQtc(400, 1)).toBe(400)
    expect(framinghamQtc(400, 1)).toBe(400)
    expect(hodgesQtc(400, 60)).toBe(400)
  })

  it('считает Bazett, Fridericia, Framingham и Hodges по заданным формулам', () => {
    const qtMs = 400
    const rrSeconds = 0.75
    const heartRate = 80
    expect(bazettQtc(qtMs, rrSeconds)).toBeCloseTo(qtMs / Math.sqrt(rrSeconds), 8)
    expect(fridericiaQtc(qtMs, rrSeconds)).toBeCloseTo(qtMs / Math.cbrt(rrSeconds), 8)
    expect(framinghamQtc(qtMs, rrSeconds)).toBeCloseTo(qtMs + 154 * (1 - rrSeconds), 8)
    expect(hodgesQtc(qtMs, heartRate)).toBeCloseTo(qtMs + 1.75 * (heartRate - 60), 8)
  })

  it('округляет половину к ближайшему целому', () => {
    expect(roundMs(450.4)).toBe(450)
    expect(roundMs(450.5)).toBe(451)
  })
})

describe('пороги QTc', () => {
  it('для мужчин подсвечивает только значение строго больше 450 и 500', () => {
    expect(qtcBand(450, 'male')).toBe('normal')
    expect(qtcBand(451, 'male')).toBe('prolonged')
    expect(qtcBand(500, 'male')).toBe('prolonged')
    expect(qtcBand(501, 'male')).toBe('high')
  })

  it('для женщин подсвечивает только значение строго больше 460 и 500', () => {
    expect(qtcBand(460, 'female')).toBe('normal')
    expect(qtcBand(461, 'female')).toBe('prolonged')
    expect(qtcBand(500, 'female')).toBe('prolonged')
    expect(qtcBand(501, 'female')).toBe('high')
  })
})

describe('computeQtc', () => {
  it('переводит ЧСС в RR и предупреждает о Bazett только при тахикардии', () => {
    const resting = computeQtc({
      qtMs: 400,
      sex: 'male',
      rate: { mode: 'heart-rate', heartRateBpm: 60 },
    })
    const fast = computeQtc({
      qtMs: 400,
      sex: 'female',
      rate: { mode: 'heart-rate', heartRateBpm: 120 },
    })

    expect(resting?.rrSeconds).toBe(1)
    expect(resting?.bazettTachycardiaWarning).toBe(false)
    expect(resting?.formulas.map((item) => item.qtcMs)).toEqual([400, 400, 400, 400])
    expect(fast?.heartRateBpm).toBe(120)
    expect(fast?.rrSeconds).toBeCloseTo(0.5, 8)
    expect(fast?.bazettTachycardiaWarning).toBe(true)
    expect(fast?.formulas[0]?.qtcMs).toBe(roundMs(400 / Math.sqrt(0.5)))
  })

  it('считает ЧСС из RR', () => {
    const result = computeQtc({
      qtMs: 360,
      sex: 'male',
      rate: { mode: 'rr', rrSeconds: 0.8 },
    })
    expect(result?.heartRateBpm).toBeCloseTo(75, 8)
    expect(result?.formulas.find((item) => item.id === 'hodges')?.qtcMs).toBe(
      roundMs(360 + 1.75 * (75 - 60)),
    )
  })

  it('не считает при нулевых и нечисловых значениях', () => {
    expect(
      computeQtc({ qtMs: 0, sex: 'male', rate: { mode: 'heart-rate', heartRateBpm: 60 } }),
    ).toBeNull()
    expect(
      computeQtc({ qtMs: 400, sex: 'male', rate: { mode: 'heart-rate', heartRateBpm: 0 } }),
    ).toBeNull()
    expect(computeQtc({ qtMs: 400, sex: 'female', rate: { mode: 'rr', rrSeconds: -1 } })).toBeNull()
    expect(
      computeQtc({ qtMs: Number.NaN, sex: 'male', rate: { mode: 'heart-rate', heartRateBpm: 70 } }),
    ).toBeNull()
  })

  it('границу тахикардии проводит строго выше 100', () => {
    expect(
      computeQtc({ qtMs: 400, sex: 'male', rate: { mode: 'heart-rate', heartRateBpm: 100 } })
        ?.bazettTachycardiaWarning,
    ).toBe(false)
    expect(
      computeQtc({ qtMs: 400, sex: 'male', rate: { mode: 'heart-rate', heartRateBpm: 101 } })
        ?.bazettTachycardiaWarning,
    ).toBe(true)
  })
})
