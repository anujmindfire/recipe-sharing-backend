import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
        process: 'readonly',
        Buffer: 'readonly',
        global: 'readonly', 
      },
    },
  },
  pluginJs.configs.recommended,
];
