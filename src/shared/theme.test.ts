import { describe, expect, it } from 'vitest'
import { isThemePreference, resolveTheme } from './theme'

describe('resolveTheme', () => {
  it('оставляет явный выбор, даже если система другого цвета', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  it('следует системе, когда выбрано «как в системе»', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
  })
})

describe('isThemePreference', () => {
  it('принимает только три известных значения', () => {
    expect(isThemePreference('light')).toBe(true)
    expect(isThemePreference('dark')).toBe(true)
    expect(isThemePreference('system')).toBe(true)
    expect(isThemePreference('Light')).toBe(false)
    expect(isThemePreference('')).toBe(false)
    expect(isThemePreference(null)).toBe(false)
  })
})
