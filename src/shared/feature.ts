export const featureIds = ['calculators', 'ecg', 'patients', 'settings'] as const

export type FeatureId = (typeof featureIds)[number]

export interface AppFeature {
  readonly id: FeatureId
  readonly title: string
  readonly summary: string
}
