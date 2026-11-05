export const featureIds = ['calculators', 'ecg', 'patients', 'settings'] as const

export type FeatureId = (typeof featureIds)[number]

export interface AppFeature {
  readonly id: FeatureId
  readonly path: `/${FeatureId}`
  readonly titleKey: `nav.${FeatureId}`
  readonly summaryKey: `features.${FeatureId}.summary`
}
