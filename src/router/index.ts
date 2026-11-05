import { createRouter, createWebHashHistory } from 'vue-router'
import CalculatorLayout from '@/features/calculators/CalculatorLayout.vue'
import CalculatorsView from '@/features/calculators/CalculatorsView.vue'
import Cha2ds2VascView from '@/features/calculators/Cha2ds2VascView.vue'
import HasBledView from '@/features/calculators/HasBledView.vue'
import HeartView from '@/features/calculators/HeartView.vue'
import QtcView from '@/features/calculators/QtcView.vue'
import EcgView from '@/features/ecg/EcgView.vue'
import PatientView from '@/features/patients/PatientView.vue'
import PatientsLayout from '@/features/patients/PatientsLayout.vue'
import PatientsView from '@/features/patients/PatientsView.vue'
import SettingsView from '@/features/settings/SettingsView.vue'
import { i18n } from '@/shared/i18n'
import { usePinStore } from '@/stores/pin'
import { usePreferencesStore } from '@/stores/preferences'
import LockView from '@/views/LockView.vue'
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
      path: '/lock',
      name: 'lock',
      component: LockView,
      meta: { hideTabs: true },
    },
    {
      path: '/about',
      name: 'about',
      component: DisclaimerView,
    },
    {
      path: '/calculators',
      component: CalculatorLayout,
      children: [
        {
          path: '',
          name: 'calculators',
          component: CalculatorsView,
        },
        {
          path: 'qtc',
          name: 'calculator-qtc',
          component: QtcView,
        },
        {
          path: 'cha2ds2-vasc',
          name: 'calculator-cha2ds2-vasc',
          component: Cha2ds2VascView,
        },
        {
          path: 'has-bled',
          name: 'calculator-has-bled',
          component: HasBledView,
        },
        {
          path: 'heart',
          name: 'calculator-heart',
          component: HeartView,
        },
      ],
    },
    {
      path: '/ecg',
      name: 'ecg',
      component: EcgView,
    },
    {
      path: '/patients',
      component: PatientsLayout,
      children: [
        {
          path: '',
          name: 'patients',
          component: PatientsView,
        },
        {
          path: 'new',
          name: 'patient-new',
          component: PatientView,
        },
        {
          path: ':id',
          name: 'patient',
          component: PatientView,
        },
      ],
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
    },
  ],
})

router.afterEach((to) => {
  document.title = pageTitle(to.name)
  window.scrollTo(0, 0)
})

function pageTitle(name: unknown): string {
  const brand = 'CardioAssist'
  switch (name) {
    case 'calculators':
      return `${i18n.global.t('nav.calculators')} — ${brand}`
    case 'calculator-qtc':
      return `${i18n.global.t('calculators.qtc.title')} — ${brand}`
    case 'calculator-cha2ds2-vasc':
      return `${i18n.global.t('calculators.cha2ds2Vasc.title')} — ${brand}`
    case 'calculator-has-bled':
      return `${i18n.global.t('calculators.hasBled.title')} — ${brand}`
    case 'calculator-heart':
      return `${i18n.global.t('calculators.heart.title')} — ${brand}`
    case 'ecg':
      return `${i18n.global.t('ecg.title')} — ${brand}`
    case 'patients':
    case 'patient':
    case 'patient-new':
      return `${i18n.global.t('patients.title')} — ${brand}`
    case 'settings':
      return `${i18n.global.t('settings.title')} — ${brand}`
    case 'about':
      return `${i18n.global.t('disclaimer.aboutTitle')} — ${brand}`
    case 'lock':
      return `${i18n.global.t('settings.lockTitle')} — ${brand}`
    default:
      return brand
  }
}

router.beforeEach((to) => {
  const preferences = usePreferencesStore()
  if (!preferences.disclaimerAccepted && to.name !== 'disclaimer') {
    return { name: 'disclaimer' }
  }
  if (preferences.disclaimerAccepted && to.name === 'disclaimer') {
    return { name: 'calculators' }
  }
  const pin = usePinStore()
  if (pin.configured && !pin.unlocked && to.name !== 'lock') {
    return { name: 'lock' }
  }
  if ((!pin.configured || pin.unlocked) && to.name === 'lock') {
    return { name: 'calculators' }
  }
  return true
})
