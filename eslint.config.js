import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import noTailwindPatterns from './eslint-rules/no-tailwind-patterns.js'

// Custom plugin for Tailwind pattern detection
const noTailwindPlugin = {
  meta: {
    name: 'no-tailwind',
    version: '1.0.0'
  },
  rules: {
    'no-tailwind-patterns': noTailwindPatterns
  }
}

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      'no-tailwind': noTailwindPlugin
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Warn on Tailwind patterns during migration, can be changed to 'error' after migration complete
      'no-tailwind/no-tailwind-patterns': 'warn'
    }
  },
])
