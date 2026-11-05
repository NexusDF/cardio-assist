import { describe, expect, it } from 'vitest'
import { clampScale, fitImage, hitCaliper, screenToImage, zoomAt } from './view'

describe('fitImage', () => {
  it('fits the whole photo inside the view and centers it', () => {
    expect(fitImage(200, 100, 400, 100)).toEqual({ scale: 0.5, originX: 0, originY: 25 })
  })
})

describe('zoomAt', () => {
  it('keeps the focus point on the same image pixel', () => {
    const next = zoomAt({ scale: 1, originX: 10, originY: 20 }, 30, 40, 2)
    expect(next).toEqual({ scale: 2, originX: -10, originY: 0 })
    const before = screenToImage(30, 40, { scale: 1, originX: 10, originY: 20 })
    const after = next ? screenToImage(30, 40, next) : null
    expect(after).toEqual(before)
  })

  it('clamps the scale', () => {
    expect(clampScale(100)).toBe(8)
    expect(clampScale(0)).toBe(0.15)
  })
})

describe('hitCaliper', () => {
  it('picks the nearer line inside the touch slop', () => {
    expect(hitCaliper(10, [12, 40], 2, 22)).toBe(0)
    expect(hitCaliper(39, [12, 40], 2, 22)).toBe(1)
    expect(hitCaliper(80, [12, 40], 2, 22)).toBeNull()
  })
})
