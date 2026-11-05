import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import eslintConfigPrettier from 'eslint-config-prettier'
import { globalIgnores } from 'eslint/config'

export default defineConfigWithVueTs(
  globalIgnores(['dist/**', 'dev-dist/**', 'coverage/**', '**/*.vue.js']),
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.strict,
  {
    name: 'cardioassist/strict',
    files: ['**/*.{ts,vue}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'vue/multi-word-component-names': ['error', { ignores: ['App'] }],
    },
  },
  eslintConfigPrettier,
)
