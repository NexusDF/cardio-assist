import { calculatorsFeature } from '@/features/calculators'
import { ecgFeature } from '@/features/ecg'
import { patientsFeature } from '@/features/patients'
import { settingsFeature } from '@/features/settings'
import type { AppFeature } from '@/shared/feature'

export { featureIds } from '@/shared/feature'
export type { AppFeature, FeatureId } from '@/shared/feature'

export const features = [
  calculatorsFeature,
  ecgFeature,
  patientsFeature,
  settingsFeature,
] as const satisfies readonly AppFeature[]
