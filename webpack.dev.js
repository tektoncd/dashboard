const merge = require('webpack-merge');

const common = require('./webpack.common.js');
const { API_DOMAIN, PORT } = require('./config_frontend/config.json');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    historyApiFallback: true,
    hot: true,
    overlay: true,
    port: process.env.PORT || PORT,
    proxy: {
      '/v1': {
        target: process.env.API_DOMAIN || API_DOMAIN
      }
    },
    stats: 'minimal'
  }
});
