import type { AppFeature } from '@/shared/feature'

export const calculatorsFeature = {
  id: 'calculators',
  title: 'Калькуляторы',
  summary: 'QTc, CHA₂DS₂-VASc, HAS-BLED и HEART. Формулы живут отдельно от экрана.',
} as const satisfies AppFeature
