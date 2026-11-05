import { createRouter, createWebHashHistory } from 'vue-router'
import CalculatorsView from '@/features/calculators/CalculatorsView.vue'
import EcgView from '@/features/ecg/EcgView.vue'
import PatientsView from '@/features/patients/PatientsView.vue'
import SettingsView from '@/features/settings/SettingsView.vue'
import { usePreferencesStore } from '@/stores/preferences'
import DisclaimerView from '@/views/DisclaimerView.vue'

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: { name: 'calculators' },
    },
    {
      path: '/disclaimer',
      name: 'disclaimer',
      component: DisclaimerView,
      meta: { hideTabs: true },
    },
    {
      path: '/about',
      name: 'about',
      component: DisclaimerView,
    },
    {
      path: '/calculators',
      name: 'calculators',
      component: CalculatorsView,
    },
    {
      path: '/ecg',
      name: 'ecg',
      component: EcgView,
    },
    {
      path: '/patients',
      name: 'patients',
      component: PatientsView,
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
    },
  ],
})

router.beforeEach((to) => {
  const preferences = usePreferencesStore()
  if (!preferences.disclaimerAccepted && to.name !== 'disclaimer') {
    return { name: 'disclaimer' }
  }
  if (preferences.disclaimerAccepted && to.name === 'disclaimer') {
    return { name: 'calculators' }
  }
  return true
})
