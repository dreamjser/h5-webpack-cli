import fs from 'fs'
import path from 'path'
import fileModule from '@dreamjser/file'
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// 获取运行环境目录路径
export const getCurrentPath = (p) => {
  return path.join(process.cwd(), p)
}

// 获取appConfig
export const getAppConfig = async () => {
  const config = await import(getCurrentPath('app.config.js'))
  return config.default
}

// 获取vueLoaderConfig
export const getVueLoaderConfig = () => {
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
export const cssLoaders = (options) => {
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
export const styleLoaders = (options) => {
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

export const getGlobalConfig = async () => {
  const env = process.env.currentEnv
  let envConfg

  try {
    envConfg = await import(getCurrentPath(`config/${env}.env.js`))
  } catch (error) {
    envConfg = await import(getCurrentPath(`config/dev.env.js`))
  }

  return envConfg.default
}

export const createModuleRouterReact = (modules, cb) => {
  let routeConf = `import React from 'react'\nexport default [`

  modules.forEach((module) => {
    const confPath = path.join(process.cwd(), `src/modules/${module}/conf.json`);

    try {
      const jsonData = fs.readFileSync(confPath, 'utf-8');
      const conf = JSON.parse(jsonData);

      Object.keys(conf).forEach(sencondKey => {
        const secondConf = conf[sencondKey]

        Object.keys(secondConf).forEach(thirdKey => {
          const thirdConf = secondConf[thirdKey]

          routeConf +=
          (
            `{\n` +
            `  name: '${module}${sencondKey}${thirdKey}',\n` +
            `  path: '/${module}/${sencondKey}/${thirdKey}',\n` +
            `  component: React.lazy(() => import('@\/modules\/${module}\/views\/${sencondKey}\/${thirdKey}')),\n` +
            `  meta: ${JSON.stringify(thirdConf)}`+
            `},\n`
          )

        })


      })
    } catch (error) {

    }

  })

  fileModule.mkdir('.tmp', () => {
    fs.writeFile(
      getCurrentPath(`.tmp/routers.ts`),
      routeConf + " ]",
      cb
    );
  })
}

export const createModuleRouterVue = (modules, cb) => {
  let routeConf = '['

  modules.forEach((module) => {
    const confPath = path.join(process.cwd(), `src/modules/${module}/conf.json`);
    try {
      const jsonData = fs.readFileSync(confPath, 'utf-8');
      const conf = JSON.parse(jsonData);

      Object.keys(conf).forEach(sencondKey => {
        const secondConf = conf[sencondKey]

        Object.keys(secondConf).forEach(thirdKey => {
          const thirdConf = secondConf[thirdKey]
          routeConf +=
          (
            `{\n` +
            `  name: '${module}${sencondKey}${thirdKey}',\n` +
            `  path: '/${module}/${sencondKey}/${thirdKey}',\n` +
            `  component: () => import('@\/modules\/${module}\/views\/${sencondKey}\/${thirdKey}'),\n` +
            `  meta: ${JSON.stringify(thirdConf)}` +
            `},\n`
          )

        })
      })
    } catch (error) {

    }

  })
  fileModule.mkdir('.tmp', () => {
    fs.writeFile(
      getCurrentPath(`.tmp/routers.ts`),
      'export default '+ routeConf + " ]",
      cb
    );
  })
}

export const createRouterChildren = async (cb) => {
  let params = process.env.currentModules
  let framework = process.env.currentFramework
  let allModules = fs.readdirSync(getCurrentPath('src/modules'))
  let envConfg = await getGlobalConfig()
  let isProd = envConfg.NODE_ENV.indexOf('production') >= 0? true: false

  if(params.toLocaleLowerCase() === 'all' || isProd) {
    params = allModules
  }else{
    params = params.split(',')
  }

  framework === 'vue'? createModuleRouterVue(params, cb): createModuleRouterReact(params, cb)
}

export const createMultiPage = async (cb) => {
  let params = process.env.currentModules
  let framework = process.env.currentFramework
  let allModules = fs.readdirSync(getCurrentPath('src/modules'))
  let envConfg = await getGlobalConfig()
  let appConfig = await getAppConfig()
  let isProd = envConfg.NODE_ENV.indexOf('production') >= 0? true: false

  if(params.toLocaleLowerCase() === 'all' || isProd) {
    params = allModules
  }

  params.forEach((module) => {
    const confPath = path.join(process.cwd(), `src/modules/${module}/conf.json`);
    try {
      const jsonData = fs.readFileSync(confPath, 'utf-8');
      const conf = JSON.parse(jsonData);

      Object.keys(conf).forEach(sencondKey => {
        const secondConf = conf[sencondKey]

        Object.keys(secondConf).forEach(thirdKey => {
          const thirdPath = path.join(process.cwd(), `.tmp/multiple/${module}/${sencondKey}/${thirdKey}`)
          const content = framework === 'vue'?
          (
            `import '@/common/styles/app.less'\n`+
            `import '@/common/app'\n`+
            `import { createApp } from 'vue'\n`+
            `import { createPinia } from 'pinia'\n`+
            `import Render from '@/modules/${module}/views/${sencondKey}/${thirdKey}.vue'\n`+
            `const pinia = createPinia()\n`+
            `const vm = createApp(Render)\n`+
            `vm.use(pinia)\n`+
            `vm.mount('#${appConfig.containerId}')\n`+
            `App.vm = vm`
          )
          :
          (
            `import '@/common/styles/app.less'\n`+
            `import React from 'react'\n`+
            `import { createRoot } from 'react-dom/client'\n`+
            `import Entry from '@/modules/${module}/views/${sencondKey}/${thirdKey}'\n`+
            `import '@/common/app'\n`+
            `const root = createRoot(document.getElementById('${appConfig.containerId}') as HTMLElement)\n`+
            `root.render(<Entry />)`
          )
          fileModule.mkdir(thirdPath, () => {
            fs.writeFile(
              thirdPath + `/main.${framework === 'vue'? 'js': 'tsx'}`,
              content,
              () => {}
            )
          })
        })
      })
    } catch (error) {

    }

  })

  setTimeout(cb, 1000)
}

export const getMulitEntry = async () => {
  let params = process.env.currentModules
  let framework = process.env.currentFramework
  let allModules = fs.readdirSync(getCurrentPath('src/modules'))
  let envConfg = await getGlobalConfig()
  let isProd = envConfg.NODE_ENV.indexOf('production') >= 0? true: false

  if(params.toLocaleLowerCase() === 'all' || isProd) {
    params = allModules
  }

  const entrys = {}
  const entryData = {}

  params.forEach((module) => {
    const confPath = path.join(process.cwd(), `src/modules/${module}/conf.json`);

    try {
      const jsonData = fs.readFileSync(confPath, 'utf-8');
      const conf = JSON.parse(jsonData);

      Object.keys(conf).forEach(sencondKey => {
        const secondConf = conf[sencondKey]

        Object.keys(secondConf).forEach(thirdKey => {
          const thirdConf = secondConf[thirdKey]
          entrys[`${module}/${sencondKey}/${thirdKey}`] = getCurrentPath(`.tmp/multiple/${module}/${sencondKey}/${thirdKey}/main.${framework === 'vue'? 'js': 'tsx'}`)
          entryData[`${module}/${sencondKey}/${thirdKey}`] = thirdConf
        })
      })
    } catch (error) {

    }

  })

  return {
    entryData,
    entrys,
  }
}
