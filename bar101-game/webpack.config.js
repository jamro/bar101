const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bar101-app.[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.module\.css$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          }
        ]
      },
      {
        test: /\.css$/i,
        exclude: /\.module\.css$/i,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    }),
    new CopyPlugin({
      patterns: [
        { from: "../bar101-storytree", to: "story" },
        { from : "./assets/img", to: "img" },
      ],
    }),
    new webpack.DefinePlugin({
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()).replace(/[TZ\-:\."]/g, '').substring(2, 14)
    }),
  ],
  devServer: {
    static: './dist',
    port: 3000,
    hot: true
  }
};