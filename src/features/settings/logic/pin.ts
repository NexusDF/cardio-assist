export const pinStorageKey = 'cardioassist.pin'
export const pinKdfIterations = 210_000

export interface PinRecord {
  readonly kdf: 'PBKDF2'
  readonly hash: 'SHA-256'
  readonly iterations: number
  readonly salt: string
  readonly verifier: string
}

export function isPinShape(pin: string): boolean {
  return /^\d{4,8}$/.test(pin)
}

export async function createPinRecord(
  pin: string,
  iterations = pinKdfIterations,
): Promise<PinRecord | null> {
  if (!isPinShape(pin) || !Number.isInteger(iterations) || iterations < 1) return null
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const verifier = await deriveVerifier(pin, salt, iterations)
  return {
    kdf: 'PBKDF2',
    hash: 'SHA-256',
    iterations,
    salt: bytesToBase64(salt),
    verifier: bytesToBase64(verifier),
  }
}

export async function pinMatches(pin: string, record: PinRecord): Promise<boolean> {
  if (!isPinShape(pin)) return false
  const derived = await deriveVerifier(pin, base64ToBytes(record.salt), record.iterations)
  return constantTimeEqual(bytesToBase64(derived), record.verifier)
}

export function parsePinRecord(raw: string | null): PinRecord | null {
  if (raw === null || raw.trim() === '') return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!isRecord(parsed)) return null
  if (parsed.kdf !== 'PBKDF2' || parsed.hash !== 'SHA-256') return null
  if (!Number.isInteger(parsed.iterations) || Number(parsed.iterations) < 1) return null
  if (typeof parsed.salt !== 'string' || typeof parsed.verifier !== 'string') return null
  return {
    kdf: 'PBKDF2',
    hash: 'SHA-256',
    iterations: Number(parsed.iterations),
    salt: parsed.salt,
    verifier: parsed.verifier,
  }
}

export function serializePinRecord(record: PinRecord): string {
  return JSON.stringify(record)
}

async function deriveVerifier(
  pin: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pin),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: arrayBuffer(salt), iterations },
    material,
    256,
  )
  return new Uint8Array(bits)
}

function arrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(copy).set(bytes)
  return copy
}

function constantTimeEqual(left: string, right: string): boolean {
  const a = new TextEncoder().encode(left)
  const b = new TextEncoder().encode(right)
  const length = Math.max(a.length, b.length)
  let mismatch = a.length === b.length ? 0 : 1
  for (let index = 0; index < length; index += 1) {
    mismatch |= (a[index] ?? 0) ^ (b[index] ?? 0)
  }
  return mismatch === 0
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000))
  }
  return btoa(binary)
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return bytes
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
