#!/usr/bin/env node
const ora = require('ora')
const chalk = require('chalk')
const webpack = require('webpack')
const webpackConfig = require('../build/webpack.prod.conf')
const HtmlWebpackPlugin  = require('html-webpack-plugin')
const { getGlobalConfig,getAppConfig, getCurrentPath, getMulitEntry } = require('../build/utils')
const spinner = ora('building for production...')

const envConfig = getAppConfig()
const globalConfig = getGlobalConfig()
if(!globalConfig) {
  console.log(chalk.red('环境变量错误'))
  return
}

webpackConfig.plugins.push(new webpack.DefinePlugin({
  GLOBAL_CONFIG: globalConfig
}))

const framework = process.env.currentFramework

// 单页面
if(process.env.pageType === 'single') {
  webpackConfig.entry = {
    app: [getCurrentPath(`src/portal/index.${framework === 'vue'? 'ts': 'tsx'}`)],
  }
  webpackConfig.plugins.push(new HtmlWebpackPlugin({
    filename: 'index.html',
    template: getCurrentPath('index.html'),
    vhost: envConfig.PUBLIC_PATH,
  }))
}else {
  const entrysObj = getMulitEntry()
  webpackConfig.entry = entrysObj.entrys



  Object.keys(entrysObj.entrys).forEach(entry => {
    console.log(entrysObj.entryData[entry].title)
    webpackConfig.plugins.push(new HtmlWebpackPlugin({
      filename: entry + '.html',
      template: getCurrentPath('index.html'),
      chunks: [entry],
      title: entrysObj.entryData[entry].title,
      vhost: envConfig.PUBLIC_PATH,
    }))
  })
}

exports.createProdFunc = function(createFunc) {
  spinner.start();

  createFunc(() => {
    webpack(webpackConfig, (err, stats) => {
      spinner.stop();
      if (err) throw err;
      process.stdout.write(
        stats.toString({
          colors: true,
          modules: false,
          children: false,
          chunks: false,
          chunkModules: false
        }) + '\n\n'
      );

      if (stats.hasErrors()) {
        console.log(chalk.red('  Build failed with errors.\n'));
        process.exit(1);
      }

      console.log(chalk.cyan('  Build complete.\n'));
    })
  })
}




