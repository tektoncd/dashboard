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
  ]
};
