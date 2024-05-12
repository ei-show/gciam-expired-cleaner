module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: 'standard-with-typescript',
  overrides: [],
  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },
  rules: {
    quotes: ['error', 'single'],
    'no-var': ['warn'],
    'sort-imports': ['warn'],
    'comma-dangle': [''],
  },
}
