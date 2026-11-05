export const hasBledReviewedOn = '2026-11-05'
export const hasBledMaxScore = 9

export interface HasBledInput {
  readonly ageYears: number
  readonly hypertension: boolean
  readonly renal: boolean
  readonly liver: boolean
  readonly stroke: boolean
  readonly bleeding: boolean
  readonly labileInr: boolean
  readonly drugs: boolean
  readonly alcohol: boolean
}

export interface HasBledResult {
  readonly score: number
  readonly maxScore: typeof hasBledMaxScore
  readonly agePoint: 0 | 1
}

export function hasBledAgePoint(ageYears: number): 0 | 1 {
  return ageYears > 65 ? 1 : 0
}

export function hasBled(input: HasBledInput): HasBledResult | null {
  if (!Number.isInteger(input.ageYears) || input.ageYears < 0) return null

  const flags = [
    input.hypertension,
    input.renal,
    input.liver,
    input.stroke,
    input.bleeding,
    input.labileInr,
    input.drugs,
    input.alcohol,
  ]
  const agePoint = hasBledAgePoint(input.ageYears)
  const score = flags.filter(Boolean).length + agePoint

  return { score, maxScore: hasBledMaxScore, agePoint }
}
