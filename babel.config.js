/*
Copyright 2019 The Tekton Authors
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

module.exports = api => {
  api.cache(true);

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          corejs: '3.6',
          exclude: ['@babel/plugin-transform-regenerator'],
          modules: false,
          useBuiltIns: 'entry'
        }
      ],
      '@babel/preset-react'
    ],
    plugins: [
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-export-default-from',
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-transform-runtime'
    ],
    env: {
      development: {
        sourceMaps: true,
        plugins: ['react-hot-loader/babel']
      },
      test: {
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                node: 'current'
              }
            }
          ]
        ]
      }
    }
  };
};
