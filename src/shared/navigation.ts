import { featureIds, type FeatureId } from '@/shared/feature'

export function sectionOf(path: string): FeatureId | null {
  const pathname = path.split('?')[0] ?? path
  return featureIds.find((id) => pathname === `/${id}` || pathname.startsWith(`/${id}/`)) ?? null
}

export function sectionKey(path: string): string {
  return sectionOf(path) ?? path
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
