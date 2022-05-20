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
const { merge } = require('webpack-merge');

const common = require('./webpack.common');
const { API_DOMAIN, PORT } = require('./config_frontend/config.json');

const mode = 'development';
const customAPIDomain = process.env.API_DOMAIN;

module.exports = merge(common({ mode }), {
  mode,
  devtool: 'eval-source-map',
  devServer: {
    client: {
      overlay: {
        errors: true,
        warnings: false
      }
    },
    compress: false,
    historyApiFallback: true,
    hot: true,
    liveReload: false,
    port: process.env.PORT || PORT,
    proxy: [
      {
        changeOrigin: !!customAPIDomain,
        // `/api` also handles `/apis` since they have a common prefix
        context: ['/v1', '/api'],
        onError(err) {
          console.warn('webpack-dev-server proxy error:', err); // eslint-disable-line no-console
        },
        onProxyReqWs(proxyReq, req, socket, _options, _head) {
          socket.on('error', function handleProxyWSError(_err) {});
        },
        secure: false,
        target: customAPIDomain || API_DOMAIN,
        ws: true
      }
    ]
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader',
            options: { attributes: { nonce: 'tkn-dev' } }
          },
          { loader: 'css-loader', options: { sourceMap: true } },
          { loader: 'sass-loader', options: { sourceMap: true } }
        ]
      }
    ]
  },
  stats: 'minimal'
});
