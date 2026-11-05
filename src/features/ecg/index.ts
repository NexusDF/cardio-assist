import type { AppFeature } from '@/shared/feature'

export const ecgFeature = {
  id: 'ecg',
  title: 'ЭКГ по фото',
  summary: 'Снимок ленты, масштаб по сетке и циркуль интервалов. Обработка только на устройстве.',
} as const satisfies AppFeature
