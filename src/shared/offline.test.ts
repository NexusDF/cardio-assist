import { describe, expect, it } from 'vitest'
import { offlineReadyDismissed, shouldShowOfflineReady } from './offline'

describe('offline ready notice', () => {
  it('shows once, until the reader confirms it', () => {
    expect(shouldShowOfflineReady(true, null)).toBe(true)
    expect(shouldShowOfflineReady(false, null)).toBe(false)
    expect(shouldShowOfflineReady(true, '1')).toBe(false)
    expect(offlineReadyDismissed('1')).toBe(true)
    expect(offlineReadyDismissed(null)).toBe(false)
  })
})
