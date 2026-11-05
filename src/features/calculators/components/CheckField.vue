<script setup lang="ts">
defineProps<{
  label: string
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function onChange(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  emit('update:modelValue', target.checked)
}
</script>

<template>
  <label
    class="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3 text-base text-ink"
    :class="modelValue ? 'border-accent bg-surface' : 'border-line bg-surface'"
  >
    <input class="size-5 shrink-0" type="checkbox" :checked="modelValue" @change="onChange" />
    <span>{{ label }}</span>
  </label>
</template>
