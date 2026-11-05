<script setup lang="ts">
defineProps<{
  legend: string
  name: string
  modelValue: string
  options: readonly { readonly value: string; readonly label: string }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onChange(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  emit('update:modelValue', target.value)
}
</script>

<template>
  <fieldset>
    <legend class="text-sm font-semibold text-ink">{{ legend }}</legend>
    <div class="mt-2 flex flex-col gap-2">
      <label
        v-for="option in options"
        :key="option.value"
        class="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3 text-base"
        :class="
          modelValue === option.value
            ? 'border-accent bg-accent text-on-accent'
            : 'border-line bg-surface text-ink'
        "
      >
        <input
          class="sr-only"
          type="radio"
          :name="name"
          :value="option.value"
          :checked="modelValue === option.value"
          @change="onChange"
        />
        <span>{{ option.label }}</span>
      </label>
    </div>
  </fieldset>
</template>
