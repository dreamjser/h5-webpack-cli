#!/usr/bin/env node
import ora from 'ora'
import chalk from 'chalk'
import webpack from 'webpack'
import webpackConfig from '../build/webpack.prod.conf.js'
import HtmlWebpackPlugin  from 'html-webpack-plugin'
import { getGlobalConfig,getAppConfig, getCurrentPath, getMulitEntry } from '../build/utils.js'
const spinner = ora('building for production...')

const envConfig = await getAppConfig()
const globalConfig = await getGlobalConfig()

export const createProdFunc = function(createFunc) {
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
    template: getCurrentPath('template/index.html'),
    vhost: envConfig.PUBLIC_PATH,
  }))
}else {
  const entrysObj = await getMulitEntry()
  webpackConfig.entry = entrysObj.entrys

  Object.keys(entrysObj.entrys).forEach(entry => {
    webpackConfig.plugins.push(new HtmlWebpackPlugin({
      filename: entry + '.html',
      template: getCurrentPath('template/index.html'),
      chunks: [entry],
      title: entrysObj.entryData[entry].title,
      vhost: envConfig.PUBLIC_PATH,
    }))
  })
}






