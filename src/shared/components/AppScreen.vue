<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = withDefaults(
  defineProps<{
    withTabs?: boolean
  }>(),
  { withTabs: true },
)

const slots = useSlots()
const hasFooter = computed(() => Boolean(slots.footer))
</script>

<template>
  <main
    id="content"
    tabindex="-1"
    class="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pt-8 outline-none"
    :class="
      props.withTabs
        ? 'pb-[calc(6.5rem+env(safe-area-inset-bottom))]'
        : hasFooter
          ? 'pb-[calc(6rem+env(safe-area-inset-bottom))]'
          : 'pb-10'
    "
  >
    <slot />
  </main>
  <div
    v-if="hasFooter"
    class="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper px-5 pt-3"
    style="padding-bottom: max(0.75rem, env(safe-area-inset-bottom))"
  >
    <div class="mx-auto w-full max-w-lg">
      <slot name="footer" />
    </div>
  </div>
</template>
