import eslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: { parser },
    plugins: { '@typescript-eslint': eslint },
    rules: {
      ...eslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  { ignores: ['dist/', 'node_modules/'] },
];
