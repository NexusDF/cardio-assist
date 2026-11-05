<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TabBar from '@/shared/components/TabBar.vue'

const route = useRoute()
const showTabs = computed(() => route.meta.hideTabs !== true)
</script>

<template>
  <RouterView />
  <TabBar v-if="showTabs" />
</template>
