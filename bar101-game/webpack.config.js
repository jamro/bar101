const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require('webpack');
const { url } = require('inspector');
const WebpackPwaManifest = require('webpack-pwa-manifest');

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
              modules: true,
              url: false,
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
        { from : "./assets/audio", to: "audio" },
        { from : "./assets/fonts", to: "fonts" },
      ],
    }),
    new webpack.DefinePlugin({
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()).replace(/[TZ\-:\."]/g, '').substring(2, 14)
    }),
    new WebpackPwaManifest({
      name: 'Bar101',
      short_name: 'Bar101',
      description: 'Bar101 Game',
      background_color: '#000000',
      orientation: 'any',
      theme_color: '#000000',
      display: 'standalone',
      start_url: '.',
      publicPath: '/',
      icons: [
        {
          src: path.resolve(__dirname, 'assets/icon.png'),
          sizes: [96, 128, 192, 256, 384, 512],
          destination: 'icons',
          purpose: 'any maskable',
          ios: true
        }
      ],
      inject: true,
      fingerprints: false
    })
  ],
  devServer: {
    static: './dist',
    port: 3000,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  }
};