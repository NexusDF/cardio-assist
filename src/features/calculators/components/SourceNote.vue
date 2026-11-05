<script setup lang="ts">
import { useAppI18n } from '@/shared/i18n'

defineProps<{
  source: string
  reviewedOn: string
  todo: string
}>()

const { t } = useAppI18n()
</script>

<template>
  <footer class="mt-6 rounded-2xl border border-line bg-surface px-4 py-4">
    <p class="text-sm leading-relaxed text-ink">{{ source }}</p>
    <p class="mt-2 text-sm text-muted">{{ t('calculators.reviewed', { date: reviewedOn }) }}</p>
    <p class="mt-2 text-sm leading-relaxed font-semibold text-warn">TODO: {{ todo }}</p>
  </footer>
</template>
