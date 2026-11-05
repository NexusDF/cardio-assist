import { describe, expect, it } from 'vitest'
import { hasBled, hasBledAgePoint } from './hasbled'

const none = {
  ageYears: 50,
  hypertension: false,
  renal: false,
  liver: false,
  stroke: false,
  bleeding: false,
  labileInr: false,
  drugs: false,
  alcohol: false,
}

describe('HAS-BLED', () => {
  it('даёт балл за возраст только строго после 65 лет', () => {
    expect(hasBledAgePoint(65)).toBe(0)
    expect(hasBledAgePoint(66)).toBe(1)
    expect(hasBled({ ...none, ageYears: 65 })?.score).toBe(0)
    expect(hasBled({ ...none, ageYears: 66 })?.score).toBe(1)
  })

  it('даёт по одному баллу за каждый отмеченный фактор и максимум 9', () => {
    const result = hasBled({
      ageYears: 70,
      hypertension: true,
      renal: true,
      liver: true,
      stroke: true,
      bleeding: true,
      labileInr: true,
      drugs: true,
      alcohol: true,
    })
    expect(result?.score).toBe(9)
    expect(result?.agePoint).toBe(1)
  })

  it('не удваивает невыбранные пункты', () => {
    expect(hasBled({ ...none, hypertension: true, alcohol: true })?.score).toBe(2)
  })

  it('отклоняет дробный возраст', () => {
    expect(hasBled({ ...none, ageYears: 70.2 })).toBeNull()
  })
})
