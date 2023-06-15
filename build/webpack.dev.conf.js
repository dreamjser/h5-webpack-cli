const webpack  = require('webpack')
const { merge }  = require('webpack-merge')
const { getCurrentPath, styleLoaders }  = require('./utils')
const baseWebpackConfig  = require('./webpack.base.conf.js')

// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
  baseWebpackConfig.entry[name] = ['webpack-hot-middleware/client?quiet=true&reload=true'].concat(baseWebpackConfig.entry[name])
})

const devWebpackConfig = merge(baseWebpackConfig, {
  mode: 'development',
  cache: {
    type: 'memory',
  },
  module: {
    rules: styleLoaders({
      sourceMap: true,
      usePostCSS: true
    })
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ]
})

module.exports = devWebpackConfig
