const webpack  = require('webpack')
const { merge }  = require('webpack-merge')
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { styleLoaders }  = require('./utils')
const baseWebpackConfig  = require('./webpack.base.conf.js')

const framework = process.env.currentFramework

// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
  baseWebpackConfig.entry[name] = ['webpack-hot-middleware/client?quiet=true&reload=true'].concat(baseWebpackConfig.entry[name])
})

let plugins = [new webpack.HotModuleReplacementPlugin()]

if(framework === 'react') {
  plugins.push(new ReactRefreshPlugin({
    overlay: {
      sockIntegration: 'whm',
    },
  }))
}


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
  plugins,
})

module.exports = devWebpackConfig
