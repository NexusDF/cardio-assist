<script setup lang="ts">
import ThemeIcon from '@/features/settings/ThemeIcon.vue'
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
          :title="themeLabel[option]"
          class="flex min-h-12 cursor-pointer items-center justify-center rounded-xl border"
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
          <ThemeIcon :theme="option" />
          <span class="sr-only">{{ themeLabel[option] }}</span>
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
    <p class="mt-4 flex items-center gap-2 text-sm font-semibold text-ink">
      <svg
        viewBox="0 0 24 24"
        class="size-5 shrink-0 text-danger"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="currentColor"
          d="M12 20.4 10.6 19.1C5.4 14.4 2 11.4 2 7.8 2 4.9 4.2 2.7 7.1 2.7c1.7 0 3.3.8 4.3 2 1-1.2 2.6-2 4.3-2 2.9 0 5.1 2.2 5.1 5.1 0 3.6-3.4 6.6-8.6 11.3L12 20.4Z"
        />
      </svg>
      {{ t('settings.dedication') }}
    </p>
  </AppScreen>
</template>
