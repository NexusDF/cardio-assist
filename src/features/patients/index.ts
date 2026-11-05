import type { AppFeature } from '@/shared/feature'

export const patientsFeature = {
  id: 'patients',
  title: 'Картотека',
  summary: 'Локальные карточки без фамилии по умолчанию. Записи не уходят на сервер.',
} as const satisfies AppFeature
