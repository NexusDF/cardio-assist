<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppScreen from '@/shared/components/AppScreen.vue'
import { useAppI18n } from '@/shared/i18n'
import { usePinStore } from '@/stores/pin'

const { t } = useAppI18n()
const router = useRouter()
const pinStore = usePinStore()
const pin = ref('')
const wrong = ref(false)

async function submit() {
  wrong.value = false
  const opened = await pinStore.unlock(pin.value)
  if (!opened) {
    wrong.value = true
    return
  }
  await router.replace({ name: 'calculators' })
}
</script>

<template>
  <AppScreen :with-tabs="false">
    <h1 id="lock-title" class="text-[2rem] leading-tight font-semibold text-ink">
      {{ t('settings.lockTitle') }}
    </h1>
    <form class="mt-6" @submit.prevent="submit">
      <label class="sr-only" for="lock-pin">{{ t('settings.lockTitle') }}</label>
      <input
        id="lock-pin"
        v-model="pin"
        class="min-h-12 w-full rounded-xl border border-line bg-surface px-3 text-base text-ink"
        type="password"
        inputmode="numeric"
        autocomplete="off"
      />
      <p v-if="wrong" class="mt-3 text-sm text-danger" role="status">
        {{ t('settings.pinWrong') }}
      </p>
      <button
        type="submit"
        class="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-accent px-4 text-base font-semibold text-on-accent"
      >
        {{ t('settings.lockSubmit') }}
      </button>
    </form>
  </AppScreen>
</template>
