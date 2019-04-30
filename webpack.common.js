const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const styleLoader =
  process.env.NODE_ENV !== 'production'
    ? { loader: 'style-loader', options: { sourceMap: true } }
    : MiniCssExtractPlugin.loader;

module.exports = {
  entry: ['./src/index.js'],
  output: {
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        use: [
          { loader: 'babel-loader', options: { cacheDirectory: true } }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          styleLoader,
          { loader: 'css-loader', options: { sourceMap: true } },
          { loader: 'sass-loader', options: { sourceMap: true } }
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
        // 'theme-color': '#4285f4'
      }
      // hash: true
    })
  ]
};
