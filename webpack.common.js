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
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: ['./src/index.js'],
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
        include: path.resolve(__dirname, 'src'),
        use: [
          { loader: 'babel-loader', options: { cacheDirectory: true } },
          'eslint-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        loader: 'file-loader'
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        loader: 'file-loader'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Tekton Dashboard',
      favicon: path.resolve(__dirname, 'src/images', 'favicon.png'),
      template: path.resolve(__dirname, 'src', 'index.template.html'),
      meta: {
        viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no'
      }
    })
  ],
  resolve: {
    alias: {
      'react-router-dom': path.resolve('./node_modules/react-router-dom')
    }
  }
};
