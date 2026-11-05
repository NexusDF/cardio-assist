import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  parsePreferences,
  PREFERENCES_STORAGE_KEY,
  serializePreferences,
  type AppLocale,
} from '@/features/settings/preferences'
import { resolveTheme, type ResolvedTheme, type ThemePreference } from '@/shared/theme'

const themeColor: Record<ResolvedTheme, string> = {
  light: '#0f766e',
  dark: '#0e1615',
}

export const usePreferencesStore = defineStore('preferences', () => {
  const stored = parsePreferences(readRaw())
  const theme = ref<ThemePreference>(stored.theme)
  const locale = ref<AppLocale>(stored.locale)
  const disclaimerAcceptedAt = ref<string | null>(stored.disclaimerAcceptedAt)
  const systemIsDark = ref(readSystemDark())

  const disclaimerAccepted = computed(() => disclaimerAcceptedAt.value !== null)
  const resolvedTheme = computed(() => resolveTheme(theme.value, systemIsDark.value))

  applyResolvedTheme(resolvedTheme.value)

  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const onSystemTheme = (event: MediaQueryListEvent) => {
    systemIsDark.value = event.matches
    if (theme.value === 'system') applyResolvedTheme(resolveTheme('system', event.matches))
  }
  media.addEventListener('change', onSystemTheme)

  function setTheme(next: ThemePreference) {
    theme.value = next
    persist()
    applyResolvedTheme(resolvedTheme.value)
  }

  function acceptDisclaimer(now = new Date()) {
    disclaimerAcceptedAt.value = now.toISOString()
    persist()
  }

  function persist() {
    localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      serializePreferences({
        theme: theme.value,
        locale: locale.value,
        disclaimerAcceptedAt: disclaimerAcceptedAt.value,
      }),
    )
  }

  return {
    theme,
    locale,
    disclaimerAccepted,
    disclaimerAcceptedAt,
    resolvedTheme,
    setTheme,
    acceptDisclaimer,
  }
})

function readRaw(): string | null {
  try {
    return localStorage.getItem(PREFERENCES_STORAGE_KEY)
  } catch {
    return null
  }
}

function readSystemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyResolvedTheme(resolved: ResolvedTheme) {
  const root = document.documentElement
  root.dataset.theme = resolved
  root.style.colorScheme = resolved
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor[resolved])
}
