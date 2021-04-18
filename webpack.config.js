/*
 * IOTA Web Wallet - An easy-to-use yet powerful web wallet for IOTA.
 * Copyright (C) 2018-present José M. Moreno <josemmo@pm.me>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackInlineSVGPlugin = require('html-webpack-inline-svg-plugin')
const LicenseWebpackPlugin = require('license-webpack-plugin').LicenseWebpackPlugin
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const path = require('path')

const APP_VERSION = require('./package.json').version

module.exports = {
  entry: {
    app: './src/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[chunkhash].js'
  },
  resolve: {
    fallback: {
      crypto: false
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-proposal-export-default-from']
          }
        }
      },
      {
        test: /\.scss$/,
        use: [
           MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(svg|png|jpg|gif)$/,
        use: ['url-loader']
      }
    ]
  },
  plugins: [
    new LicenseWebpackPlugin({
      outputFilename: 'licenses.txt',
      perChunkOutput: false
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[chunkhash].css',
      chunkFilename: '[id].[chunkhash].css'
    }),
    new HtmlWebpackPlugin({
      favicon: 'src/favicon.ico',
      filename: 'index.html',
      template: 'src/index.html',
      app_version: APP_VERSION
    }),
    new HtmlWebpackInlineSVGPlugin({
      runPreEmit: true
    })
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true
      })
    ]
  }
}
