const webpack = require('webpack')
const chalk = require('chalk')
const proxyMiddleware = require('http-proxy-middleware')
const express = require('express')
const HtmlWebpackPlugin  = require('html-webpack-plugin')
const compression = require('compression')
const options = require('../build/webpack.dev.conf.js')
const  { getAppConfig, getCurrentPath, getMulitEntry } = require('../build/utils')
const app = express();
const appConfig = getAppConfig()
const proxyTable = appConfig.proxyTable || {}

const envConfig = getAppConfig()
const framework = process.env.currentFramework

// 单页面
if(process.env.pageType === 'single') {
  options.entry = {
    app: [getCurrentPath(`src/portal/index.${framework === 'vue'? 'js': 'tsx'}`)],
  }
  options.plugins.push(new HtmlWebpackPlugin({
    filename: 'index.html',
    template: getCurrentPath('index.html'),
    vhost: envConfig.PUBLIC_PATH,
  }))
}else {
  const entrysObj = getMulitEntry()
  options.entry = entrysObj.entrys

  Object.keys(entrysObj.entrys).forEach(entry => {
    options.plugins.push(new HtmlWebpackPlugin({
      filename: entry + '.html',
      template: getCurrentPath('index.html'),
      chunks: [entry],
      title: entrysObj.entryData[entry].title,
      vhost: envConfig.PUBLIC_PATH,
    }))
  })
}

const compiler = webpack(options);

exports.createDevFunc = (createFunc) => {
  createFunc(() => {
    const middleware = require('webpack-dev-middleware')(compiler, {publicPath: options.output.publicPath})
    const hotMiddleware = require('webpack-hot-middleware')(compiler)

    // proxy api requests
    Object.keys(proxyTable).forEach(function (context) {
      const options = proxyTable[context]
      if (typeof options === 'string') {
        options = { target: options }
      }
      app.use(proxyMiddleware.createProxyMiddleware(options.filter || context, options))
    })

    app.use(compression())

    app.use(middleware)
    app.use(hotMiddleware)
    // app.use(path.resolve('/static'), express.static('./static'))

    app.listen(3003, () =>
      console.log(chalk.cyan('app listening on port 3000! \n'))
    );
  })
}



