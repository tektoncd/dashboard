/*
Copyright 2019-2024 The Tekton Authors
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
module.exports = {
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  extends: [
    'airbnb',
    'plugin:prettier/recommended',
    'plugin:cypress/recommended',
    'plugin:storybook/recommended',
    'plugin:react/jsx-runtime'
  ],
  globals: {
    afterAll: true,
    Atomics: 'readonly',
    beforeAll: true,
    globalThis: false,
    SharedArrayBuffer: 'readonly',
    vi: true
  },
  overrides: [
    {
      files: ['*.js', '*.jsx']
    },
    {
      files: ['*.cy.js'],
      rules: {
        'func-names': 'off'
      }
    }
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  plugins: ['notice', 'react', 'formatjs'],
  rules: {
    curly: ['error', 'all'],
    'cypress/assertion-before-screenshot': 'warn',
    'default-param-last': 'off',
    'formatjs/enforce-default-message': 'error',
    'formatjs/enforce-id': 'error',
    'formatjs/no-complex-selectors': 'error',
    'formatjs/no-literal-string-in-jsx': 'off', // TODO: [AG] re-enable this after cleanup
    'formatjs/no-multiple-whitespaces': 'error',
    'formatjs/no-multiple-plurals': 'error',
    'import/named': 'off',
    'import/no-cycle': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    'import/no-unresolved': ['error', { ignore: ['\\.svg\\?react$'] }],
    'import/prefer-default-export': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'no-case-declarations': 'off',
    'no-restricted-exports': 'off',
    'no-template-curly-in-string': 'off',
    'no-unused-vars': [
      'error',
      {
        args: 'after-used',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true,
        vars: 'all'
      }
    ],
    'notice/notice': [
      'error',
      {
        templateFile: 'config_frontend/copyright.txt',
        nonMatchingTolerance: 0.95
      }
    ],
    'react/destructuring-assignment': 'off',
    'react/forbid-prop-types': 'off',
    'react/function-component-definition': 'off',
    'react/jsx-curly-newline': 'off',
    'react/jsx-filename-extension': 'off',
    'react/jsx-no-bind': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/no-unstable-nested-components': 'off',
    'react/prop-types': 'off',
    'react/require-default-props': 'off', // defaultProps for functional components deprecated in react 18.3.0, to be removed in a future release
    'react/state-in-constructor': 'off',
    'sort-imports': [
      'error',
      {
        ignoreCase: true,
        ignoreDeclarationSort: true
      }
    ]
  }
};
