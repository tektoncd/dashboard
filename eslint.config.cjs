/*
Copyright 2019-2025 The Tekton Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/* eslint-disable depend/ban-dependencies */
const { defineConfig } = require('eslint/config');

const cypress = require('eslint-plugin-cypress');
const depend = require('eslint-plugin-depend');
const formatjs = require('eslint-plugin-formatjs');
const globals = require('globals');
const importPlugin = require('eslint-plugin-import');
const { includeIgnoreFile } = require('@eslint/compat');
const js = require('@eslint/js');
const jsxA11y = require('eslint-plugin-jsx-a11y');
const notice = require('eslint-plugin-notice');
const path = require('path');
const prettier = require('eslint-plugin-prettier/recommended');
const react = require('eslint-plugin-react');
const storybook = require('eslint-plugin-storybook');

const gitignorePath = path.join(__dirname, '.gitignore');

module.exports = defineConfig([
  // List of recommended rules used as a baseline
  js.configs.recommended, // Applies 'eslint:recommended'
  react.configs.flat.recommended,
  depend.configs['flat/recommended'],
  formatjs.configs.recommended,
  importPlugin.flatConfigs.recommended,
  jsxA11y.flatConfigs.recommended,
  prettier,
  // end-of-list of recommended rules used as a baseline
  includeIgnoreFile(gitignorePath, 'Ignore patterns from .gitignore file'),
  {
    files: ['**/*.{js,jsx,cjs}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.vitest
      },

      ecmaVersion: 2022,
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },

    plugins: {
      // eslint-plugin-notice only works using this approach
      notice
    },

    settings: {
      // react version specified to quash lint warning, keep in sync with react version in package.json
      react: {
        version: '17.0.2'
      },
      // import resolver required to quash import/no-unresolved lint errors for imports without file extension
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx'],
          moduleDirectory: ['node_modules', 'src/']
        }
      }
    },

    rules: {
      curly: ['error', 'all'],
      'formatjs/enforce-description': 'off',
      'formatjs/enforce-default-message': 'error',
      'formatjs/enforce-id': 'error',
      'formatjs/no-complex-selectors': 'error',
      'formatjs/no-literal-string-in-jsx': 'off',
      'formatjs/no-multiple-whitespaces': 'error',
      'formatjs/no-multiple-plurals': 'error',
      'import/named': 'off',
      'import/no-cycle': 'error',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
      'import/no-unresolved': [
        'error',
        {
          ignore: [
            '\\.svg\\?react$',
            '\\.txt\\?raw$',
            // eslint-plugin-import doesn't currently support `exports` so complains about `storybook/actions` etc.
            'storybook/.*'
          ]
        }
      ],
      'jsx-a11y/anchor-is-valid': 'off',
      'jsx-a11y/no-static-element-interactions': 'error',
      'jsx-a11y/no-noninteractive-tabindex': 'error',
      'no-param-reassign': 'error',
      'no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          vars: 'all'
        }
      ],
      'no-use-before-define': 'error',
      'notice/notice': [
        'error',
        {
          templateFile: 'config_frontend/copyright.txt',
          nonMatchingTolerance: 0.95
        }
      ],

      'react/jsx-filename-extension': [
        'error',
        {
          allow: 'as-needed'
        }
      ],
      'react/jsx-no-useless-fragment': 'error',
      'react/no-danger': 'error',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',

      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true
        }
      ]
    }
  },
  // Overrides
  {
    // Only apply storybook recommended lint settings to relevant files
    extends: [storybook.configs['flat/recommended']],
    files: ['.storybook/*.@(js|jsx)', '**/*.stories.@(js|jsx)']
  },
  {
    // Only apply cypress recommended lint settings to relevant files
    extends: [cypress.configs.recommended],
    files: ['packages/e2e/cypress/**/*.@(js|cy.js)'],
    rules: {
      'cypress/assertion-before-screenshot': 'warn'
    }
  }
]);
