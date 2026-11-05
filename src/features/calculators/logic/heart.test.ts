import { describe, expect, it } from 'vitest'
import { heartBand, heartScore, type HeartInput } from './heart'

const zeros: HeartInput = {
  history: 0,
  ecg: 0,
  age: 0,
  riskFactors: 0,
  troponin: 0,
}

describe('HEART', () => {
  it('суммирует пять компонентов от 0 до 10', () => {
    expect(heartScore(zeros)?.score).toBe(0)
    expect(heartScore({ history: 2, ecg: 2, age: 2, riskFactors: 2, troponin: 2 })?.score).toBe(10)
    expect(heartScore({ ...zeros, history: 1, troponin: 2 })?.score).toBe(3)
  })

  it('делит риск на границах 3, 4, 6 и 7', () => {
    expect(heartBand(0)).toBe('low')
    expect(heartBand(3)).toBe('low')
    expect(heartBand(4)).toBe('intermediate')
    expect(heartBand(6)).toBe('intermediate')
    expect(heartBand(7)).toBe('high')
    expect(heartBand(10)).toBe('high')
  })

  it('отклоняет балл компонента вне 0, 1 и 2', () => {
    expect(heartScore({ ...zeros, ecg: 3 as HeartInput['ecg'] })).toBeNull()
    expect(heartScore({ ...zeros, age: -1 as HeartInput['age'] })).toBeNull()
  })
})
