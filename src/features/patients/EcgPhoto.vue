<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{
  image: Blob
  alt: string
}>()

const url = ref('')

watch(
  () => props.image,
  (image) => {
    if (url.value !== '') URL.revokeObjectURL(url.value)
    url.value = URL.createObjectURL(image)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (url.value !== '') URL.revokeObjectURL(url.value)
})
</script>

<template>
  <img :src="url" :alt="alt" class="h-16 w-16 shrink-0 rounded-lg object-cover" />
</template>
