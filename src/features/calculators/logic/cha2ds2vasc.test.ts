import { describe, expect, it } from 'vitest'
import { cha2ds2Vasc, cha2ds2VascAgePoints } from './cha2ds2vasc'

const none = {
  ageYears: 40,
  female: false,
  heartFailure: false,
  hypertension: false,
  diabetes: false,
  stroke: false,
  vascularDisease: false,
}

describe('CHA₂DS₂-VASc', () => {
  it('даёт 0 без факторов у мужчины моложе 65 лет', () => {
    expect(cha2ds2Vasc(none)?.score).toBe(0)
  })

  it('начисляет возраст один раз: 2 с 75 лет, 1 в 65–74, 0 до 65', () => {
    expect(cha2ds2VascAgePoints(64)).toBe(0)
    expect(cha2ds2VascAgePoints(65)).toBe(1)
    expect(cha2ds2VascAgePoints(74)).toBe(1)
    expect(cha2ds2VascAgePoints(75)).toBe(2)
    expect(cha2ds2Vasc({ ...none, ageYears: 80 })?.points.age).toBe(2)
    expect(cha2ds2Vasc({ ...none, ageYears: 80 })?.score).toBe(2)
  })

  it('суммирует заданные баллы и не превышает 9', () => {
    const result = cha2ds2Vasc({
      ageYears: 75,
      female: true,
      heartFailure: true,
      hypertension: true,
      diabetes: true,
      stroke: true,
      vascularDisease: true,
    })
    expect(result?.points).toEqual({
      heartFailure: 1,
      hypertension: 1,
      age: 2,
      diabetes: 1,
      stroke: 2,
      vascularDisease: 1,
      female: 1,
    })
    expect(result?.score).toBe(9)
  })

  it('отклоняет дробный и отрицательный возраст', () => {
    expect(cha2ds2Vasc({ ...none, ageYears: 65.5 })).toBeNull()
    expect(cha2ds2Vasc({ ...none, ageYears: -1 })).toBeNull()
  })
})
