const merge = require('webpack-merge');

const common = require('./webpack.common.js');
const { API_DOMAIN, PORT } = require('./config_frontend/config.json');

const extensionConfig = {
  '/v1/extensions': {
    target: 'http://localhost:9999',
    pathRewrite: { '^/v1/extensions': '' }
  },
  '/v1/extensions/dev-extension': {
    target: 'http://localhost:9999',
    pathRewrite: { '^/v1/extensions/dev-extension': '' }
  }
};

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    historyApiFallback: true,
    hot: true,
    overlay: true,
    port: process.env.PORT || PORT,
    proxy: {
      ...(process.env.EXTENSIONS_LOCAL_DEV ? extensionConfig : {}),
      '/v1': {
        target: process.env.API_DOMAIN || API_DOMAIN,
        ws: true
      },
      '/proxy': {
        target: process.env.API_DOMAIN || API_DOMAIN,
        ws: true
      }
    },
    stats: 'minimal'
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader', options: { sourceMap: true } },
          { loader: 'css-loader', options: { sourceMap: true } },
          { loader: 'sass-loader', options: { sourceMap: true } }
        ]
      }
    ]
  }
});
