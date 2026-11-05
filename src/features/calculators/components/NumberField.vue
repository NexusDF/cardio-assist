<script setup lang="ts">
defineProps<{
  label: string
  hint?: string
  modelValue: string
  numeric?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onInput(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  emit('update:modelValue', target.value)
}
</script>

<template>
  <label class="block">
    <span class="text-sm font-semibold text-ink">{{ label }}</span>
    <input
      class="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-3 text-base text-ink"
      :value="modelValue"
      :inputmode="numeric ? 'numeric' : 'decimal'"
      autocomplete="off"
      @input="onInput"
    />
    <span v-if="hint" class="mt-1 block text-sm leading-relaxed text-muted">{{ hint }}</span>
  </label>
</template>
