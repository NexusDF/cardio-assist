import { isThemePreference, type ThemePreference } from '@/shared/theme'

export const PREFERENCES_STORAGE_KEY = 'cardioassist.preferences'

export const locales = ['ru'] as const

export type AppLocale = (typeof locales)[number]

export interface Preferences {
  theme: ThemePreference
  locale: AppLocale
  disclaimerAcceptedAt: string | null
}

export const defaultPreferences: Preferences = {
  theme: 'system',
  locale: 'ru',
  disclaimerAcceptedAt: null,
}

export function parsePreferences(raw: string | null): Preferences {
  if (raw === null || raw.trim() === '') return { ...defaultPreferences }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ...defaultPreferences }
  }

  if (!isRecord(parsed)) return { ...defaultPreferences }

  return {
    theme: isThemePreference(parsed.theme) ? parsed.theme : defaultPreferences.theme,
    locale: parsed.locale === 'ru' ? 'ru' : defaultPreferences.locale,
    disclaimerAcceptedAt: isTimestamp(parsed.disclaimerAcceptedAt)
      ? parsed.disclaimerAcceptedAt
      : null,
  }
}

export function serializePreferences(value: Preferences): string {
  return JSON.stringify({
    theme: value.theme,
    locale: value.locale,
    disclaimerAcceptedAt: value.disclaimerAcceptedAt,
  })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isTimestamp(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Date.parse(value))
}
