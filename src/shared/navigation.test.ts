import { describe, expect, it } from 'vitest'
import { initialSectionPaths, rememberSectionPath, sectionKey, sectionOf } from './navigation'

describe('section paths', () => {
  it('keeps the open screen for a tab and ignores the lock screen', () => {
    const start = initialSectionPaths()
    const withHeart = rememberSectionPath(start, '/calculators/heart')
    expect(withHeart.calculators).toBe('/calculators/heart')
    expect(rememberSectionPath(withHeart, '/lock')).toBe(withHeart)
    expect(sectionOf('/patients/42')).toBe('patients')
    expect(sectionKey('/calculators/qtc')).toBe('calculators')
    expect(sectionKey('/disclaimer')).toBe('/disclaimer')
  })
})
