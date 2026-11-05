export const qtcReviewedOn = '2026-11-05'

/** Обычная граница тахикардии. Не порог шкалы: только для предупреждения о формуле Bazett. */
export const tachycardiaHeartRateBpm = 100

export type Sex = 'male' | 'female'

export type QtcFormulaId = 'bazett' | 'fridericia' | 'framingham' | 'hodges'

export type QtcBand = 'normal' | 'prolonged' | 'high'

export type QtcRate =
  | { readonly mode: 'heart-rate'; readonly heartRateBpm: number }
  | { readonly mode: 'rr'; readonly rrSeconds: number }

export interface QtcInput {
  readonly qtMs: number
  readonly sex: Sex
  readonly rate: QtcRate
}

export interface QtcFormulaResult {
  readonly id: QtcFormulaId
  readonly qtcMs: number
  readonly band: QtcBand
}

export interface QtcComputation {
  readonly qtMs: number
  readonly sex: Sex
  readonly rrSeconds: number
  readonly heartRateBpm: number
  readonly formulas: readonly QtcFormulaResult[]
  readonly bazettTachycardiaWarning: boolean
}

export function roundMs(value: number): number {
  return Math.round(value)
}

export function rrSecondsFromHeartRate(heartRateBpm: number): number {
  return 60 / heartRateBpm
}

export function heartRateFromRrSeconds(rrSeconds: number): number {
  return 60 / rrSeconds
}

/** QT / √RR. QT в мс, RR в секундах, результат в мс. */
export function bazettQtc(qtMs: number, rrSeconds: number): number {
  return qtMs / Math.sqrt(rrSeconds)
}

/** QT / ∛RR. QT в мс, RR в секундах, результат в мс. */
export function fridericiaQtc(qtMs: number, rrSeconds: number): number {
  return qtMs / Math.cbrt(rrSeconds)
}

/** QT + 154·(1 − RR). QT в мс, RR в секундах, результат в мс. */
export function framinghamQtc(qtMs: number, rrSeconds: number): number {
  return qtMs + 154 * (1 - rrSeconds)
}

/** QT + 1.75·(ЧСС − 60). QT в мс, ЧСС в ударах в минуту, результат в мс. */
export function hodgesQtc(qtMs: number, heartRateBpm: number): number {
  return qtMs + 1.75 * (heartRateBpm - 60)
}

export function qtcBand(qtcMs: number, sex: Sex): QtcBand {
  if (qtcMs > 500) return 'high'
  const limit = sex === 'male' ? 450 : 460
  if (qtcMs > limit) return 'prolonged'
  return 'normal'
}

export function computeQtc(input: QtcInput): QtcComputation | null {
  if (!isPositive(input.qtMs)) return null

  const rrSeconds =
    input.rate.mode === 'rr'
      ? input.rate.rrSeconds
      : rrSecondsFromHeartRate(input.rate.heartRateBpm)
  const heartRateBpm =
    input.rate.mode === 'heart-rate'
      ? input.rate.heartRateBpm
      : heartRateFromRrSeconds(input.rate.rrSeconds)

  if (!isPositive(rrSeconds) || !isPositive(heartRateBpm)) return null
  if (!Number.isFinite(rrSeconds) || !Number.isFinite(heartRateBpm)) return null

  const raw = [
    ['bazett', bazettQtc(input.qtMs, rrSeconds)],
    ['fridericia', fridericiaQtc(input.qtMs, rrSeconds)],
    ['framingham', framinghamQtc(input.qtMs, rrSeconds)],
    ['hodges', hodgesQtc(input.qtMs, heartRateBpm)],
  ] as const

  if (raw.some(([, value]) => !Number.isFinite(value))) return null

  return {
    qtMs: input.qtMs,
    sex: input.sex,
    rrSeconds,
    heartRateBpm,
    bazettTachycardiaWarning: heartRateBpm > tachycardiaHeartRateBpm,
    formulas: raw.map(([id, value]) => {
      const qtcMs = roundMs(value)
      return { id, qtcMs, band: qtcBand(qtcMs, input.sex) }
    }),
  }
}

function isPositive(value: number): boolean {
  return Number.isFinite(value) && value > 0
}
