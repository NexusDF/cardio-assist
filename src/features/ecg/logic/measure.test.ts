import { describe, expect, it } from 'vitest'
import {
  distancePx,
  heartRateFromRrMs,
  intervalMs,
  pixelsPerMillisecond,
  qtcFromIntervals,
  scaledPhotoSize,
  smallSquareMsByPaperSpeed,
} from './measure'

describe('paper speed', () => {
  it('converts one millimetre at the two standard speeds', () => {
    expect(smallSquareMsByPaperSpeed[25]).toBe(40)
    expect(smallSquareMsByPaperSpeed[50]).toBe(20)
  })
})

describe('scaledPhotoSize', () => {
  it('shrinks the long edge to 1600 and leaves a smaller photo alone', () => {
    expect(scaledPhotoSize(3200, 1600)).toEqual({ width: 1600, height: 800 })
    expect(scaledPhotoSize(800, 600)).toEqual({ width: 800, height: 600 })
  })

  it('rejects an empty image', () => {
    expect(scaledPhotoSize(0, 400)).toBeNull()
  })
})

describe('intervals', () => {
  it('turns a known pixel span into milliseconds', () => {
    const pxPerMs = pixelsPerMillisecond(100, 40)
    expect(pxPerMs).toBe(2.5)
    expect(intervalMs(200, pxPerMs ?? 0)).toBe(80)
    expect(distancePx(30, 10)).toBe(20)
  })

  it('rejects a zero span or a missing scale', () => {
    expect(pixelsPerMillisecond(0, 40)).toBeNull()
    expect(pixelsPerMillisecond(10, 0)).toBeNull()
    expect(intervalMs(10, 0)).toBeNull()
  })
})

describe('heart rate and QTc', () => {
  it('uses 60000 / RR and the existing QTc formulas', () => {
    expect(heartRateFromRrMs(800)).toBe(75)
    expect(heartRateFromRrMs(0)).toBeNull()
    const qtc = qtcFromIntervals(400, 1000, 'male')
    expect(qtc?.formulas.map((item) => item.qtcMs)).toEqual([400, 400, 400, 400])
    expect(qtcFromIntervals(400, 1000, '')).toBeNull()
    expect(qtcFromIntervals(null, 1000, 'female')).toBeNull()
  })
})
