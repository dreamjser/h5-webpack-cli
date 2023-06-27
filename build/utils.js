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
  const env = process.env.currentEnv
  let envConfg

  try {
    envConfg = require(getCurrentPath(`config/${env}.env.js`))
  } catch (error) {
    envConfg = require(getCurrentPath(`config/dev.env.js`))
  }

  return envConfg
}

const createModuleRouterReact = (modules, cb) => {
  let routeConf = `import React from 'react'\n export default [`

  modules.forEach((module) => {
    const confPath = path.join(process.cwd(), `src/modules/${module}/conf.json`);
    const conf = require(confPath)

    Object.keys(conf).forEach(sencondKey => {
      const secondConf = conf[sencondKey]

      Object.keys(secondConf).forEach(thirdKey => {
        const thirdConf = secondConf[thirdKey]

        routeConf += `
        {
          name: '${module}${sencondKey}${thirdKey}',
          path: '/${module}/${sencondKey}/${thirdKey}',
          component: React.lazy(() => import('@\/modules\/${module}\/views\/${sencondKey}\/${thirdKey}')),
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

  fileModule.mkdir('.tmp', () => {
    fs.writeFile(
      getCurrentPath(`.tmp/routers.ts`),
      routeConf + " ]",
      cb
    );
  })
}

const createModuleRouterVue = (modules, cb) => {
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
  fileModule.mkdir('.tmp', () => {
    fs.writeFile(
      getCurrentPath(`.tmp/routers.js`),
      'export default '+ routeConf + " ]",
      cb
    );
  })
}

const createRouterChildren = (cb) => {
  let params = process.env.currentModules
  let framework = process.env.currentFramework
  let allModules = fs.readdirSync(getCurrentPath('src/modules'))
  let isProd = getGlobalConfig().NODE_ENV.indexOf('production') >= 0? true: false

  if(params.toLocaleLowerCase() === 'all' || isProd) {
    params = allModules
  }

  framework === 'vue'? createModuleRouterVue(params, cb): createModuleRouterReact(params, cb)
}

const createMultiPage = (cb) => {
  let params = process.env.currentModules
  let framework = process.env.currentFramework
  let allModules = fs.readdirSync(getCurrentPath('src/modules'))
  let isProd = getGlobalConfig().NODE_ENV.indexOf('production') >= 0? true: false

  if(params.toLocaleLowerCase() === 'all' || isProd) {
    params = allModules
  }

  params.forEach((module) => {
    const confPath = path.join(process.cwd(), `src/modules/${module}/conf.json`);
    const conf = require(confPath)

    Object.keys(conf).forEach(sencondKey => {
      const secondConf = conf[sencondKey]

      Object.keys(secondConf).forEach(thirdKey => {
        const thirdPath = path.join(process.cwd(), `.tmp/multiple/${module}/${sencondKey}/${thirdKey}`)
        const content = framework === 'vue'? `
          import '@/common/app'
          import { createApp } from 'vue'
          import { createPinia } from 'pinia'
          import Render from '@/modules/${module}/views/${sencondKey}/${thirdKey}.vue'

          const pinia = createPinia()
          //vue实例化
          const vm = createApp(Render)

          vm.use(pinia)

          vm.mount('#app')

          App.vm = vm
        `:
        `
          import React from 'react'
          import ReactDOM from 'react-dom'
          import Entry from '@/modules/${module}/views/${sencondKey}/${thirdKey}'
          import '@/common/app'

          ReactDOM.render(<Entry />, document.getElementById('app'))
        `

        fileModule.mkdir(thirdPath, () => {
          fs.writeFile(
            thirdPath + `/main.${framework === 'vue'? 'js': 'tsx'}`,
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
  let params = process.env.currentModules
  let allModules = fs.readdirSync(getCurrentPath('src/modules'))
  let isProd = getGlobalConfig().NODE_ENV.indexOf('production') >= 0? true: false

  if(params.toLocaleLowerCase() === 'all' || isProd) {
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
        entrys[`${module}/${sencondKey}/${thirdKey}`] = getCurrentPath(`.tmp/multiple/${module}/${sencondKey}/${thirdKey}/main.js`)
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
