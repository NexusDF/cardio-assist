<script setup lang="ts">
import AppScreen from '@/shared/components/AppScreen.vue'
import { useAppI18n } from '@/shared/i18n'
import { themePreferences, type ThemePreference } from '@/shared/theme'
import { usePreferencesStore } from '@/stores/preferences'

const { t } = useAppI18n()
const preferences = usePreferencesStore()

const themeLabel: Record<ThemePreference, string> = {
  light: t('settings.themeLight'),
  dark: t('settings.themeDark'),
  system: t('settings.themeSystem'),
}

function chooseTheme(next: ThemePreference) {
  preferences.setTheme(next)
}
</script>

<template>
  <AppScreen>
    <h1 class="text-[2rem] leading-tight font-semibold text-ink">{{ t('settings.title') }}</h1>

    <fieldset class="mt-8">
      <legend class="text-sm font-semibold text-ink">{{ t('settings.theme') }}</legend>
      <div class="mt-3 grid grid-cols-3 gap-2">
        <label
          v-for="option in themePreferences"
          :key="option"
          class="flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-2 text-center text-sm font-semibold"
          :class="
            preferences.theme === option
              ? 'border-accent bg-accent text-on-accent'
              : 'border-line bg-surface text-ink'
          "
        >
          <input
            class="sr-only"
            type="radio"
            name="theme"
            :value="option"
            :checked="preferences.theme === option"
            @change="chooseTheme(option)"
          />
          {{ themeLabel[option] }}
        </label>
      </div>
    </fieldset>

    <section class="mt-8" aria-labelledby="language-title">
      <h2 id="language-title" class="text-sm font-semibold text-ink">
        {{ t('settings.language') }}
      </h2>
      <p
        class="mt-3 rounded-2xl border border-line bg-surface px-4 py-4 text-base leading-relaxed text-muted"
      >
        {{ t('settings.languageCurrent') }}
      </p>
    </section>

    <RouterLink
      :to="{ name: 'about' }"
      class="mt-8 inline-flex min-h-12 items-center justify-center rounded-2xl border border-line bg-surface px-4 text-base font-semibold text-ink"
    >
      {{ t('settings.about') }}
    </RouterLink>

    <p class="mt-8 text-sm leading-relaxed text-muted">{{ t('settings.storage') }}</p>
  </AppScreen>
</template>
