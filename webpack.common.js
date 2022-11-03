/*
Copyright 2019-2022 The Tekton Authors
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
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = ({ mode }) => ({
  output: {
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        type: 'javascript/auto'
      },
      {
        test: /\.js$/,
        exclude: [path.resolve(__dirname, 'packages', 'e2e')],
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'packages'),
          path.resolve(__dirname, './node_modules/monaco-editor')
        ],
        use: [{ loader: 'babel-loader', options: { cacheDirectory: true } }]
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'file-loader'
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack', 'file-loader']
      },
      {
        test: /\.(woff|woff2)$/,
        loader: 'file-loader'
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, './node_modules/monaco-editor'),
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.ttf$/,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: mode,
      I18N_PSEUDO: false
    }),
    new ESLintPlugin({
      files: 'src'
    }),
    new HtmlWebpackPlugin({
      title: 'Tekton Dashboard',
      favicon: path.resolve(__dirname, 'src/images', 'favicon.png'),
      template: path.resolve(__dirname, 'src', 'index.template.html')
    }),
    new MonacoWebpackPlugin({
      languages: ['yaml'],
      customLanguages: [
        {
          label: 'yaml',
          entry: 'monaco-yaml',
          worker: {
            id: 'monaco-yaml/yamlWorker',
            entry: 'monaco-yaml/yaml.worker'
          }
        }
      ]
    })
  ],
  resolve: {
    alias: {
      'react-router-dom': path.resolve('./node_modules/react-router-dom')
    }
  }
});
