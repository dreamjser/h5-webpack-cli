const fs = require('fs')
const path = require('path')
const fileModule = require('@dreamjser/file')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

// 获取运行环境目录路径
const getCurrentPath = (p) => {
  return path.join(process.cwd(), p)
}

// 获取appConfig
const getAppConfig = () => {
  const config = require(getCurrentPath('app.config'))
  return config
}

// 获取vueLoaderConfig
const getVueLoaderConfig = () => {
  return {
    loaders: cssLoaders({
      sourceMap: true,
    }),
    cssSourceMap: true,
    cacheBusting: true,
    transformToRequire: {
      video: ['src', 'poster'],
      source: 'src',
      img: 'src',
      image: 'xlink:href'
    }
  }
}

// css-loader
const cssLoaders = (options) => {
  options = options || {}

  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap,
    }
  }

  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap,
      postcssOptions: {
        config: path.resolve(__dirname, getCurrentPath('postcss.config.js')),
      }
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders(loader, loaderOptions) {
    const loaders = [cssLoader, postcssLoader]

    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    if (options.extract) {
      loaders.unshift(MiniCssExtractPlugin.loader)
      return loaders
    }else{
      return ['vue-style-loader'].concat(loaders);
    }
  }

  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// style-loader
const styleLoaders = (options) => {
  const output = []
  const loaders = cssLoaders(options)

  for (const extension in loaders) {
    const loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }

  return output
}

const getGlobalConfig = () => {
  const env = process.argv[process.argv.length - 1]
  let envConfg

  try {
    envConfg = require(getCurrentPath(`config/${env}.env.js`))
  } catch (error) {
    envConfg = require(getCurrentPath(`config/dev.env.js`))
  }

  return envConfg
}

const createModuleRouter = (modules, cb) => {
  let routeConf = '['

  modules.forEach((module) => {
    const confPath = path.join(process.cwd(), `src/modules/${module}/conf.json`);
    const conf = require(confPath)

    Object.keys(conf).forEach(sencondKey => {
      const secondConf = conf[sencondKey]

      Object.keys(secondConf).forEach(thirdKey => {
        const thirdConf = secondConf[thirdKey]
        console.log(thirdConf, '==')

        routeConf += `
        {
          name: '${module}${sencondKey}${thirdKey}',
          path: '/${module}/${sencondKey}/${thirdKey}',
          component: () => import('@\/modules\/${module}\/views\/${sencondKey}\/${thirdKey}'),
          meta: {
            title: '${thirdConf.title}',
            needLogin: ${!thirdConf.hasOwnProperty('needLogin')? true: thirdConf.needLogin},
            checkCard: ${!!thirdConf.checkCard},
            checkTransfer: ${!!thirdConf.checkTransfer}
          }
        },
        `
      })
    })
  })

  fs.writeFile(
    getCurrentPath(`src/portal/single/routers.js`),
    'export default '+ routeConf + " ]",
    cb
  );

}

const createRouterChildren = (cb) => {
  let params = process.argv.length === 3? process.argv[2].split(','): null
  let allModules = fs.readdirSync(getCurrentPath('src/modules'))
  let isProd = getGlobalConfig().NODE_ENV.indexOf('production') >= 0? true: false

  if(!params || isProd) {
    params = allModules
  }

  createModuleRouter(params, cb)
}

const createMultiPage = (cb) => {
  let params = process.argv.length === 3? process.argv[2].split(','): null
  let allModules = fs.readdirSync(getCurrentPath('src/modules'))
  let isProd = getGlobalConfig().NODE_ENV.indexOf('production') >= 0? true: false

  if(!params || isProd) {
    params = allModules
  }

  params.forEach((module) => {
    const confPath = path.join(process.cwd(), `src/modules/${module}/conf.json`);
    const conf = require(confPath)

    Object.keys(conf).forEach(sencondKey => {
      const secondConf = conf[sencondKey]

      Object.keys(secondConf).forEach(thirdKey => {
        const thirdConf = secondConf[thirdKey]
        const thirdPath = path.join(process.cwd(), `src/portal/multiple/${module}/${sencondKey}/${thirdKey}`)
        const content = `
          import '@/common/app'
          import Vue from 'vue'
          import Render from '@/modules/${module}/views/${sencondKey}/${thirdKey}.vue'

          App.vm = new Vue({
            el: '#app',
            render: (h) => h(Render),
          })
        `
        fileModule.mkdir(thirdPath, () => {
          fs.writeFile(
            thirdPath + '/main.js',
            content,
            () => {}
          )
        })
      })
    })
  })

  setTimeout(cb, 1000)
}

const getMulitEntry = () => {
  let params = process.argv.length === 3? process.argv[2].split(','): null
  let allModules = fs.readdirSync(getCurrentPath('src/modules'))
  let isProd = getGlobalConfig().NODE_ENV.indexOf('production') >= 0? true: false

  if(!params || isProd) {
    params = allModules
  }

  const entrys = {}
  const entryData = {}

  params.forEach((module) => {
    const confPath = path.join(process.cwd(), `src/modules/${module}/conf.json`);
    const conf = require(confPath)

    Object.keys(conf).forEach(sencondKey => {
      const secondConf = conf[sencondKey]

      Object.keys(secondConf).forEach(thirdKey => {
        const thirdConf = secondConf[thirdKey]
        entrys[`${module}/${sencondKey}/${thirdKey}`] = getCurrentPath(`src/portal/multiple/${module}/${sencondKey}/${thirdKey}/main.js`)
        entryData[`${module}/${sencondKey}/${thirdKey}`] = thirdConf
      })
    })
  })

  return {
    entryData,
    entrys,
  }
}

exports.getAppConfig = getAppConfig

exports.getCurrentPath = getCurrentPath

exports.styleLoaders = styleLoaders

exports.getVueLoaderConfig = getVueLoaderConfig

exports.getGlobalConfig = getGlobalConfig

exports.createRouterChildren = createRouterChildren

exports.createMultiPage = createMultiPage

exports.getMulitEntry = getMulitEntry
