<script setup lang="ts">
import ModulePlaceholder from '@/shared/components/ModulePlaceholder.vue'
import { useAppI18n } from '@/shared/i18n'

const { t } = useAppI18n()
</script>

<template>
  <ModulePlaceholder :title="t('patients.title')" :body="t('patients.empty')" />
</template>
