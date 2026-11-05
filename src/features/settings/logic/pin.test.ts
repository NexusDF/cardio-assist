import { describe, expect, it } from 'vitest'
import { createPinRecord, isPinShape, parsePinRecord, pinMatches, serializePinRecord } from './pin'

describe('pin', () => {
  it('accepts 4 to 8 digits', () => {
    expect(isPinShape('1234')).toBe(true)
    expect(isPinShape('123')).toBe(false)
    expect(isPinShape('12ab')).toBe(false)
  })

  it('verifies the stored PIN and ignores a damaged record', async () => {
    const record = await createPinRecord('1234', 1_000)
    expect(record).not.toBeNull()
    if (record === null) return
    expect(await pinMatches('1234', record)).toBe(true)
    expect(await pinMatches('9999', record)).toBe(false)
    const restored = parsePinRecord(serializePinRecord(record))
    expect(restored?.verifier).toBe(record.verifier)
    expect(parsePinRecord('nope')).toBeNull()
  })
})
