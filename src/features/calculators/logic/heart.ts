export const heartReviewedOn = '2026-11-05'
export const heartMaxScore = 10
export const heartLevels = [0, 1, 2] as const

export type HeartLevel = (typeof heartLevels)[number]
export type HeartBand = 'low' | 'intermediate' | 'high'

export interface HeartInput {
  readonly history: HeartLevel
  readonly ecg: HeartLevel
  readonly age: HeartLevel
  readonly riskFactors: HeartLevel
  readonly troponin: HeartLevel
}

export interface HeartResult {
  readonly score: number
  readonly maxScore: typeof heartMaxScore
  readonly band: HeartBand
}

export function isHeartLevel(value: number): value is HeartLevel {
  return heartLevels.some((level) => level === value)
}

export function heartBand(score: number): HeartBand {
  if (score <= 3) return 'low'
  if (score <= 6) return 'intermediate'
  return 'high'
}

export function heartScore(input: HeartInput): HeartResult | null {
  const parts = [input.history, input.ecg, input.age, input.riskFactors, input.troponin]
  if (parts.some((part) => !isHeartLevel(part))) return null

  const score = parts.reduce<number>((sum, part) => sum + part, 0)
  return { score, maxScore: heartMaxScore, band: heartBand(score) }
}
