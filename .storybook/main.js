/*
Copyright 2020-2023 The Tekton Authors
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

const path = require('path');

module.exports = {
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-storysource'
  ],
  core: {
    builder: {
      name: 'webpack5',
      options: {
        lazyCompilation: true,
        fsCache: true
      }
    }
  },
  reactOptions: {
    fastRefresh: true,
    strictMode: false // set in the decorator instead to workaround Storybook issue 12977
  },
  stories: [
    '../src/**/*.stories.js',
    '../packages/**/*.stories.js'
  ],
  webpackFinal: async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    config.module.rules.push({
      test: /\.mjs$/,
      type: 'javascript/auto'
    },{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        presets: [
          ['@babel/preset-env', { modules: 'commonjs' }]
        ]
      }
    }, {
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
      include: path.resolve(__dirname, '../'),
    }, {
      test: /\.yaml$/,
      type: 'json',
      loader: 'yaml-loader',
      options: { asJSON: true }
    });

    return config;
  }
};
