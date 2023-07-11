const webpack = require('webpack')
const chalk = require('chalk')
const path = require('path')
const WebpackDevServer = require('webpack-dev-server')
const HtmlWebpackPlugin  = require('html-webpack-plugin')
const options = require('../build/webpack.dev.conf.js')
const  { getAppConfig, getCurrentPath, getMulitEntry } = require('../build/utils')
const appConfig = getAppConfig()
const proxy = appConfig.proxyTable || {}

const envConfig = getAppConfig()
const framework = process.env.currentFramework

// 单页面
if(process.env.pageType === 'single') {
  options.entry = {
    app: [getCurrentPath(`src/portal/index.${framework === 'vue'? 'ts': 'tsx'}`)],
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
    let server = new WebpackDevServer(compiler, {
      client: {
        overlay: false,
      },
      compress: true,
      hot: true,
      proxy,
    })
    console.log(chalk.cyan(`app listening on port ${appConfig.devPort}! \n`))
    server.listen(appConfig.devPort)
  })
}



