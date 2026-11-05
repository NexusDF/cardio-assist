export const cha2ds2VascReviewedOn = '2026-11-05'
export const cha2ds2VascMaxScore = 9

export interface Cha2ds2VascInput {
  readonly ageYears: number
  readonly female: boolean
  readonly heartFailure: boolean
  readonly hypertension: boolean
  readonly diabetes: boolean
  readonly stroke: boolean
  readonly vascularDisease: boolean
}

export interface Cha2ds2VascPoints {
  readonly heartFailure: 0 | 1
  readonly hypertension: 0 | 1
  readonly age: 0 | 1 | 2
  readonly diabetes: 0 | 1
  readonly stroke: 0 | 2
  readonly vascularDisease: 0 | 1
  readonly female: 0 | 1
}

export interface Cha2ds2VascResult {
  readonly score: number
  readonly maxScore: typeof cha2ds2VascMaxScore
  readonly points: Cha2ds2VascPoints
}

export function cha2ds2VascAgePoints(ageYears: number): 0 | 1 | 2 {
  if (ageYears >= 75) return 2
  if (ageYears >= 65) return 1
  return 0
}

export function cha2ds2Vasc(input: Cha2ds2VascInput): Cha2ds2VascResult | null {
  if (!Number.isInteger(input.ageYears) || input.ageYears < 0) return null

  const points: Cha2ds2VascPoints = {
    heartFailure: input.heartFailure ? 1 : 0,
    hypertension: input.hypertension ? 1 : 0,
    age: cha2ds2VascAgePoints(input.ageYears),
    diabetes: input.diabetes ? 1 : 0,
    stroke: input.stroke ? 2 : 0,
    vascularDisease: input.vascularDisease ? 1 : 0,
    female: input.female ? 1 : 0,
  }
  const score =
    points.heartFailure +
    points.hypertension +
    points.age +
    points.diabetes +
    points.stroke +
    points.vascularDisease +
    points.female

  return { score, maxScore: cha2ds2VascMaxScore, points }
}
