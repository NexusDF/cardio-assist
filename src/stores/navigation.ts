import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { FeatureId } from '@/shared/feature'
import { initialSectionPaths, rememberSectionPath } from '@/shared/navigation'

export const useNavigationStore = defineStore('navigation', () => {
  const sectionPath = ref<Record<FeatureId, string>>(initialSectionPaths())

  function remember(path: string) {
    sectionPath.value = rememberSectionPath(sectionPath.value, path)
  }

  return { sectionPath, remember }
})
