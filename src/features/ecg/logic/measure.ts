import { computeQtc, type QtcComputation, type Sex } from '@/features/calculators/logic/qtc'

/** 1 мм бумаги. 25 мм/с → 40 мс, 50 мм/с → 20 мс. Это перевод скорости, не клинический порог. */
export const smallSquareMsByPaperSpeed = {
  25: 40,
  50: 20,
} as const

export type PaperSpeed = keyof typeof smallSquareMsByPaperSpeed

export const maxPhotoEdgePx = 1600

export interface EcgIntervals {
  readonly rrMs: number | null
  readonly prMs: number | null
  readonly qrsMs: number | null
  readonly qtMs: number | null
}

export function scaledPhotoSize(
  width: number,
  height: number,
  maxEdge = maxPhotoEdgePx,
): { width: number; height: number } | null {
  if (!isPositive(width) || !isPositive(height)) return null
  const ratio = Math.min(1, maxEdge / Math.max(width, height))
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  }
}

export function pixelsPerMillisecond(distancePx: number, knownMs: number): number | null {
  if (!isPositive(distancePx) || !isPositive(knownMs)) return null
  const value = distancePx / knownMs
  return Number.isFinite(value) ? value : null
}

export function intervalMs(distancePx: number, pxPerMs: number): number | null {
  if (!isPositive(distancePx) || !isPositive(pxPerMs)) return null
  const value = distancePx / pxPerMs
  if (!Number.isFinite(value)) return null
  return Math.round(value)
}

export function heartRateFromRrMs(rrMs: number): number | null {
  if (!isPositive(rrMs)) return null
  const value = 60_000 / rrMs
  if (!Number.isFinite(value)) return null
  return Math.round(value)
}

export function distancePx(start: number, end: number): number {
  return Math.abs(end - start)
}

export function qtcFromIntervals(
  qtMs: number | null,
  rrMs: number | null,
  sex: Sex | '',
): QtcComputation | null {
  if (qtMs === null || rrMs === null || (sex !== 'male' && sex !== 'female')) return null
  return computeQtc({ qtMs, sex, rate: { mode: 'rr', rrSeconds: rrMs / 1000 } })
}

function isPositive(value: number): boolean {
  return Number.isFinite(value) && value > 0
}
