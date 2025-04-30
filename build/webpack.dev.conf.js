import webpack from 'webpack'
import { merge } from 'webpack-merge'
import ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import { styleLoaders } from './utils.js'
import baseWebpackConfig from './webpack.base.conf.js'

const framework = process.env.currentFramework

// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
  baseWebpackConfig.entry[name] = ['webpack-hot-middleware/client?quiet=true&reload=true'].concat(baseWebpackConfig.entry[name])
})

let plugins = []

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

export default devWebpackConfig
