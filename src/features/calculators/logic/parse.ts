export function parsePositiveNumber(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.')
  if (normalized === '') return null
  const value = Number(normalized)
  if (!Number.isFinite(value) || value <= 0) return null
  return value
}

export function parseAgeYears(raw: string): number | null {
  const normalized = raw.trim()
  if (!/^\d{1,3}$/.test(normalized)) return null
  const value = Number(normalized)
  if (!Number.isInteger(value) || value > 130) return null
  return value
}
