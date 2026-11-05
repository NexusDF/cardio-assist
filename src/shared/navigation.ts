import { featureIds, type FeatureId } from '@/shared/feature'

export function sectionOf(path: string): FeatureId | null {
  const pathname = path.split('?')[0] ?? path
  return featureIds.find((id) => pathname === `/${id}` || pathname.startsWith(`/${id}/`)) ?? null
}

export function sectionKey(path: string): string {
  return sectionOf(path) ?? path
}

export type TabMotion = 'tab-forward' | 'tab-back' | 'tab-none'

export function tabMotion(fromPath: string, toPath: string): TabMotion {
  const from = sectionOf(fromPath)
  const to = sectionOf(toPath)
  if (from === null || to === null || from === to) return 'tab-none'
  return featureIds.indexOf(to) > featureIds.indexOf(from) ? 'tab-forward' : 'tab-back'
}

export function rememberSectionPath(
  current: Record<FeatureId, string>,
  path: string,
): Record<FeatureId, string> {
  const section = sectionOf(path)
  if (section === null) return current
  return { ...current, [section]: path.split('?')[0] ?? path }
}

export function initialSectionPaths(): Record<FeatureId, string> {
  return {
    calculators: '/calculators',
    ecg: '/ecg',
    patients: '/patients',
    settings: '/settings',
  }
}
