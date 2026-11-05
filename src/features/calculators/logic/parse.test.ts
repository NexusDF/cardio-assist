import { describe, expect, it } from 'vitest'
import { parseAgeYears, parsePositiveNumber } from './parse'

describe('parsePositiveNumber', () => {
  it('принимает запятую как десятичный разделитель', () => {
    expect(parsePositiveNumber(' 80,5 ')).toBe(80.5)
    expect(parsePositiveNumber('0')).toBeNull()
    expect(parsePositiveNumber('-2')).toBeNull()
    expect(parsePositiveNumber('')).toBeNull()
    expect(parsePositiveNumber('abc')).toBeNull()
  })
})

describe('parseAgeYears', () => {
  it('принимает целые годы от 0 до 130', () => {
    expect(parseAgeYears('0')).toBe(0)
    expect(parseAgeYears('65')).toBe(65)
    expect(parseAgeYears('130')).toBe(130)
    expect(parseAgeYears('131')).toBeNull()
    expect(parseAgeYears('65.5')).toBeNull()
    expect(parseAgeYears('')).toBeNull()
  })
})
