import type { AppFeature } from '@/shared/feature'

export const patientsFeature = {
  id: 'patients',
  path: '/patients',
  titleKey: 'nav.patients',
  summaryKey: 'features.patients.summary',
} as const satisfies AppFeature
