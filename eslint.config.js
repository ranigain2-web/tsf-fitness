import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // The local-first invariant (ANALYSIS.md): nothing in app code may
      // reach for the network. Console noise is flagged so accidental
      // debug/log beacons never ship.
      'no-console': 'warn',
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    // js.configs.recommended already applies globally above; this block
    // only adds the Node globals for plain-JS files.
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    files: ['scripts/**/*.ts'],
    // Node CLI scripts: console IS the interface. The no-console rule
    // exists for app code (the local-first no-beacons invariant);
    // headless tooling is not app code.
    rules: {
      'no-console': 'off',
    },
  },
)
