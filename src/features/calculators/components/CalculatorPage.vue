<script setup lang="ts">
import AppScreen from '@/shared/components/AppScreen.vue'
import { useAppI18n } from '@/shared/i18n'

defineProps<{
  title: string
}>()

const { t } = useAppI18n()
</script>

<template>
  <AppScreen>
    <RouterLink
      :to="{ name: 'calculators' }"
      class="inline-flex min-h-11 items-center text-sm font-semibold text-accent"
    >
      {{ t('calculators.back') }}
    </RouterLink>
    <h1 class="mt-2 text-[2rem] leading-tight font-semibold text-ink">{{ title }}</h1>
    <slot />
  </AppScreen>
</template>
