const webpack = require('webpack')
const { merge } = require('webpack-merge')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
// const CopyWebpackPlugin = require('copy-webpack-plugin')
const { getCurrentPath, styleLoaders } = require('./utils')
const baseWebpackConfig = require('./webpack.base.conf.js')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const prodWebpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
  module: {
    rules: styleLoaders({
      sourceMap: false,
      extract: true,
      usePostCSS: true
    })
  },
  optimization: {
    minimize: true,
    runtimeChunk: {
      name: 'runtime',
    },
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          filename: 'static/js/vendor.[chunkhash].js',
        },
      },
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash].css'
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'disabled',
      generateStatsFile: true,
    }),
    // // copy custom static assets
    // new CopyWebpackPlugin([
    //   {
    //     from: getCurrentPath('./static'),
    //     to: getCurrentPath('./dist'),
    //     // ignore: ['.*']
    //   }
    // ])
  ]
});

module.exports = prodWebpackConfig;
