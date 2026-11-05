import { defineStore } from 'pinia'
import { appMeta } from '@/shared/meta'
import { features } from '@/shared/features'

export const useAppStore = defineStore('app', () => {
  return {
    name: appMeta.name,
    description: appMeta.description,
    modules: features,
  }
})
