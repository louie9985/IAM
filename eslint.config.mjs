import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    name: 'iam/global-ignores',
    ignores: [
      '**/.turbo/**',
      '**/build/**',
      '**/coverage/**',
      '**/dist/**',
      '**/generated/**',
      '**/node_modules/**',
      '.superpowers/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    name: 'iam/source-defaults',
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,tsx}'],
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  {
    name: 'iam/node-tooling',
    files: ['**/*.config.{js,mjs,cjs,ts,mts,cts}', 'tools/**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: {
      globals: globals.node,
    },
  },
  eslintConfigPrettier,
];
