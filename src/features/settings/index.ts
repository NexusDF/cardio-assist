import type { AppFeature } from '@/shared/feature'

export const settingsFeature = {
  id: 'settings',
  path: '/settings',
  titleKey: 'nav.settings',
  summaryKey: 'features.settings.summary',
} as const satisfies AppFeature
