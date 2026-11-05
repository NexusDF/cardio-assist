import type { AppFeature } from '@/shared/feature'

export const calculatorsFeature = {
  id: 'calculators',
  path: '/calculators',
  titleKey: 'nav.calculators',
  summaryKey: 'features.calculators.summary',
} as const satisfies AppFeature
