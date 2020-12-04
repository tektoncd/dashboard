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
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const contentSecurityPolicy = {
  development:
    "default-src 'none'; img-src 'self'; script-src 'self' 'unsafe-eval'; style-src blob: 'nonce-tkn-dev'; connect-src 'self' wss: ws:; font-src 'self' https://fonts.gstatic.com;",
  production:
    "default-src 'none'; img-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self' wss: ws:; font-src 'self' https://fonts.gstatic.com;"
};

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
        include: path.resolve(__dirname, 'src'),
        use: [
          { loader: 'babel-loader', options: { cacheDirectory: true } },
          'eslint-loader'
        ]
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
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        loader: 'file-loader'
      }
    ]
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: mode,
      I18N_PSEUDO: false
    }),
    new HtmlWebpackPlugin({
      title: 'Tekton Dashboard',
      favicon: path.resolve(__dirname, 'src/images', 'favicon.png'),
      template: path.resolve(__dirname, 'src', 'index.template.html'),
      meta: {
        'Content-Security-Policy': {
          'http-equiv': 'Content-Security-Policy',
          content: contentSecurityPolicy[mode]
        }
      }
    })
  ],
  resolve: {
    alias: {
      'react-router-dom': path.resolve('./node_modules/react-router-dom')
    }
  }
});
