const merge = require('webpack-merge');

const common = require('./webpack.common.js');
const { API_DOMAIN, PORT } = require('./config_frontend/config.json');

const extensionConfig = {
  '/v1/extensions': {
    target: 'http://localhost:9999',
    pathRewrite: { '^/v1/extensions': '' }
  },
  '/v1/extension/dev-extension': {
    target: 'http://localhost:9999',
    pathRewrite: { '^/v1/extension/dev-extension': '' }
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
        target: process.env.API_DOMAIN || API_DOMAIN
      }
    },
    stats: 'minimal'
  }
});
