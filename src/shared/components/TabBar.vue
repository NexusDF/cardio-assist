<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { featureIds, features } from '@/shared/features'
import { useAppI18n } from '@/shared/i18n'
import { sectionOf } from '@/shared/navigation'
import { useNavigationStore } from '@/stores/navigation'
import FeatureIcon from './FeatureIcon.vue'

const { t } = useAppI18n()
const navigation = useNavigationStore()
const route = useRoute()
const activeIndex = computed(() => {
  const section = sectionOf(route.path)
  return section === null ? -1 : featureIds.indexOf(section)
})
</script>

<template>
  <nav
    class="tab-bar fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface"
    style="padding-bottom: env(safe-area-inset-bottom)"
    :aria-label="t('nav.label')"
  >
    <div class="relative mx-auto max-w-lg">
      <span
        v-if="activeIndex >= 0"
        aria-hidden="true"
        class="pointer-events-none absolute inset-x-0 top-0 h-0.5"
      >
        <span
          class="tab-indicator block h-full w-1/4 bg-accent"
          :style="{ transform: `translateX(${activeIndex * 100}%)` }"
        />
      </span>
      <ul class="grid grid-cols-4">
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
    </div>
  </nav>
</template>
