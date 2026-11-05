import { describe, expect, it } from 'vitest'
import { decryptJson, encryptJson } from './backup'

describe('encrypted backup', () => {
  it('round-trips JSON and rejects the wrong password', async () => {
    const encrypted = await encryptJson('correct horse', '{"patients":[]}', 1_000)
    expect(encrypted).not.toBeNull()
    expect(await decryptJson('correct horse', encrypted ?? '')).toBe('{"patients":[]}')
    expect(await decryptJson('wrong', encrypted ?? '')).toBeNull()
    expect(await decryptJson('correct horse', '{')).toBeNull()
    expect(await encryptJson('', 'x', 1_000)).toBeNull()
  })
})
