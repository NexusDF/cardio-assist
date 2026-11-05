import type { AppFeature } from '@/shared/feature'

export const ecgFeature = {
  id: 'ecg',
  path: '/ecg',
  titleKey: 'nav.ecg',
  summaryKey: 'features.ecg.summary',
} as const satisfies AppFeature
