import webpack from 'webpack'
import chalk from 'chalk'
import WebpackDevServer from 'webpack-dev-server'
import HtmlWebpackPlugin  from 'html-webpack-plugin'
import options from '../build/webpack.dev.conf.js'
import { getAppConfig, getCurrentPath, getMulitEntry, getGlobalConfig } from '../build/utils.js'
const appConfig = await getAppConfig()
const proxy = appConfig.proxyTable || {}

const envConfig = await getGlobalConfig()
const framework = process.env.currentFramework

// 单页面
if(process.env.pageType === 'single') {
  options.entry = {
    app: [getCurrentPath(`src/portal/index.${framework === 'vue'? 'ts': 'tsx'}`)],
  }
  options.plugins.push(new HtmlWebpackPlugin({
    filename: 'index.html',
    template: getCurrentPath('template/index.html'),
    vhost: envConfig.PUBLIC_PATH,
  }))
}else {
  const entrysObj = await getMulitEntry()
  options.entry = entrysObj.entrys

  Object.keys(entrysObj.entrys).forEach(entry => {
    options.plugins.push(new HtmlWebpackPlugin({
      filename: entry + '.html',
      template: getCurrentPath('template/index.html'),
      chunks: [entry],
      title: entrysObj.entryData[entry].title,
      vhost: envConfig.PUBLIC_PATH,
    }))
  })
}

const compiler = webpack(options);

export const createDevFunc = (createFunc) => {
  createFunc(() => {
    let server = new WebpackDevServer({
      client: {
        overlay: false,
      },
      compress: true,
      historyApiFallback: true,
      proxy,
      hot: true,
      open: true,
      port: appConfig.devPort,
      headers: {
        "Access-Control-Allow-Origin": "*",
      }
    }, compiler)
    console.log(chalk.cyan(`app listening on port ${appConfig.devPort}! \n`))
    server.start()
  })
}



