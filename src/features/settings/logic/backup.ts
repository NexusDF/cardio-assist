export const backupFormat = 'cardioassist-backup-v1'
export const backupKdfIterations = 210_000

export interface EncryptedBackup {
  readonly format: typeof backupFormat
  readonly kdf: 'PBKDF2'
  readonly hash: 'SHA-256'
  readonly iterations: number
  readonly salt: string
  readonly iv: string
  readonly ciphertext: string
}

export async function encryptJson(
  password: string,
  plaintext: string,
  iterations = backupKdfIterations,
): Promise<string | null> {
  if (password === '' || !Number.isInteger(iterations) || iterations < 1) return null
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt, iterations)
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext),
  )
  const envelope: EncryptedBackup = {
    format: backupFormat,
    kdf: 'PBKDF2',
    hash: 'SHA-256',
    iterations,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
  }
  return JSON.stringify(envelope)
}

export async function decryptJson(password: string, raw: string): Promise<string | null> {
  const envelope = parseEnvelope(raw)
  if (envelope === null || password === '') return null
  try {
    const key = await deriveKey(password, base64ToBytes(envelope.salt), envelope.iterations)
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: arrayBuffer(base64ToBytes(envelope.iv)) },
      key,
      arrayBuffer(base64ToBytes(envelope.ciphertext)),
    )
    return new TextDecoder().decode(plain)
  } catch {
    return null
  }
}

async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt: arrayBuffer(salt), iterations },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

function parseEnvelope(raw: string): EncryptedBackup | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!isRecord(parsed)) return null
  if (parsed.format !== backupFormat || parsed.kdf !== 'PBKDF2' || parsed.hash !== 'SHA-256') {
    return null
  }
  if (!Number.isInteger(parsed.iterations) || Number(parsed.iterations) < 1) return null
  if (
    typeof parsed.salt !== 'string' ||
    typeof parsed.iv !== 'string' ||
    typeof parsed.ciphertext !== 'string'
  ) {
    return null
  }
  return {
    format: backupFormat,
    kdf: 'PBKDF2',
    hash: 'SHA-256',
    iterations: Number(parsed.iterations),
    salt: parsed.salt,
    iv: parsed.iv,
    ciphertext: parsed.ciphertext,
  }
}

function arrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(copy).set(bytes)
  return copy
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
