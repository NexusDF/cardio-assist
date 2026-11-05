<script setup lang="ts">
import { useAppI18n } from '@/shared/i18n'

defineProps<{
  ready: boolean
  online: boolean
}>()

const emit = defineEmits<{
  dismiss: []
}>()

const { t } = useAppI18n()
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 top-0 z-30 flex flex-col gap-2 px-4 pt-3">
    <div
      v-if="!online"
      class="pointer-events-auto mx-auto w-full max-w-lg rounded-2xl border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-ink shadow-sm"
      role="status"
    >
      {{ t('offline.now') }}
    </div>
    <div
      v-if="ready"
      class="pointer-events-auto mx-auto w-full max-w-lg rounded-2xl border border-accent bg-surface px-4 py-3 text-sm leading-relaxed text-ink shadow-sm"
      role="status"
    >
      <p>{{ t('offline.ready') }}</p>
      <button
        type="button"
        class="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-accent px-4 text-base font-semibold text-on-accent"
        @click="emit('dismiss')"
      >
        {{ t('offline.ok') }}
      </button>
    </div>
  </div>
</template>
