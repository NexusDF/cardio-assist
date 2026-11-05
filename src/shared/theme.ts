export const themePreferences = ['light', 'dark', 'system'] as const

export type ThemePreference = (typeof themePreferences)[number]

export type ResolvedTheme = 'light' | 'dark'

export function resolveTheme(preference: ThemePreference, systemIsDark: boolean): ResolvedTheme {
  if (preference === 'system') return systemIsDark ? 'dark' : 'light'
  return preference
}

export function isThemePreference(value: unknown): value is ThemePreference {
  return themePreferences.some((theme) => theme === value)
}
