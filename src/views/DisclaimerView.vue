<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppScreen from '@/shared/components/AppScreen.vue'
import { useAppI18n } from '@/shared/i18n'
import { usePreferencesStore } from '@/stores/preferences'

const route = useRoute()
const router = useRouter()
const preferences = usePreferencesStore()
const { t } = useAppI18n()

const mode = computed(() => (route.name === 'about' ? 'about' : 'gate'))
const points = ['role', 'device', 'decision', 'storage', 'export'] as const

function accept() {
  preferences.acceptDisclaimer()
  void router.replace({ name: 'calculators' })
}
</script>

<template>
  <AppScreen :with-tabs="mode === 'about'">
    <p class="text-sm font-semibold text-accent">{{ t('disclaimer.eyebrow') }}</p>
    <h1 class="mt-2 text-[2rem] leading-tight font-semibold text-ink">
      {{ mode === 'about' ? t('disclaimer.aboutTitle') : t('disclaimer.title') }}
    </h1>
    <ul class="mt-6 flex flex-col gap-3">
      <li
        v-for="point in points"
        :key="point"
        class="rounded-2xl border border-line bg-surface px-4 py-4 text-base leading-relaxed text-ink"
      >
        {{ t(`disclaimer.points.${point}`) }}
      </li>
    </ul>
    <template v-if="mode === 'gate'" #footer>
      <button
        type="button"
        class="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-accent px-4 text-base font-semibold text-on-accent"
        @click="accept"
      >
        {{ t('disclaimer.accept') }}
      </button>
    </template>
    <RouterLink
      v-if="mode === 'about'"
      :to="{ name: 'settings' }"
      class="mt-8 inline-flex min-h-12 items-center justify-center rounded-2xl border border-line bg-surface px-4 text-base font-semibold text-ink"
    >
      {{ t('disclaimer.back') }}
    </RouterLink>
  </AppScreen>
</template>
