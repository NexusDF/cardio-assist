import type { AppFeature } from '@/shared/feature'

export const settingsFeature = {
  id: 'settings',
  title: 'Настройки',
  summary: 'Тема, язык и то, как данные лежат в браузере этого устройства.',
} as const satisfies AppFeature
