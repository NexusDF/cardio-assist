<script setup lang="ts">
import { features } from '@/shared/features'
import { useAppI18n } from '@/shared/i18n'
import { useNavigationStore } from '@/stores/navigation'
import FeatureIcon from './FeatureIcon.vue'

const { t } = useAppI18n()
const navigation = useNavigationStore()
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface"
    style="padding-bottom: env(safe-area-inset-bottom)"
    :aria-label="t('nav.label')"
  >
    <ul class="mx-auto grid max-w-lg grid-cols-4">
      <li v-for="feature in features" :key="feature.id">
        <RouterLink
          v-slot="{ href, navigate, isActive }"
          :to="navigation.sectionPath[feature.id]"
          custom
        >
          <a
            :href="href"
            class="flex min-h-16 w-full flex-col items-center justify-center gap-1 px-1 py-1.5 text-center text-xs leading-tight font-semibold"
            :class="isActive ? 'text-accent' : 'text-muted'"
            :aria-current="isActive ? 'page' : undefined"
            @click="navigate"
          >
            <FeatureIcon :id="feature.id" />
            <span>{{ t(feature.titleKey) }}</span>
          </a>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>
