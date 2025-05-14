import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  // Ignore dist folder
  { ignores: ['dist'] },

  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020, // This defines the JS version you're working with
      globals: globals.browser, // Global variables for browser environment
      parserOptions: {
        ecmaVersion: 'latest', // Ensures latest JS features are enabled
        ecmaFeatures: { jsx: true }, // Enables JSX parsing
        sourceType: 'module' // Allows ES Modules
      }
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      // Apply recommended JS rules from eslint-config
      ...js.configs.recommended.rules,

      // Apply recommended React Hook rules
      ...reactHooks.configs.recommended.rules,

      // Custom Rules
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }], // Ignore unused vars with names like constants (e.g., MAX_SIZE)
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ],

      // React-specific rules
      'react/prop-types': 'off', // Optional: if you don't want PropTypes validation
      'react/react-in-jsx-scope': 'off', // Optional: if you're using React 17 JSX Transform
      'react/jsx-uses-react': 'off', // Optional: required for React 17 JSX Transform
      'react/jsx-uses-vars': 'error', // Make sure JSX variables are used

      // Best Practices
      'no-console': ['warn', { allow: ['warn', 'error'] }], // Warn on console.log usage
      'no-debugger': 'warn', // Warn on debugger statements
      'no-magic-numbers': ['warn', { ignore: [0, 1] }], // Magic numbers should be avoided
      eqeqeq: ['error', 'smart'] // Always use strict equality (===) except for null
    }
  }
];
