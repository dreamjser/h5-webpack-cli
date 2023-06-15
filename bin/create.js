#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const readline = require('readline')
const fileModule = require('@dreamjser/file')
const { getAppConfig, getCurrentPath } = require('../build/utils.js')

const appConfig = getAppConfig()
const mkdir = fileModule.mkdir

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

if(process.argv.length < 3) {
  console.log(chalk.yellow('请输入目录名称 \n'))
  return
}

const sPath = process.argv[2]

if (sPath.indexOf(appConfig.modulePrefix) < 0 || sPath.indexOf('/') < 0) {
  console.log(chalk.yellow(`目录名称不规范，请参考${appConfig.modulePrefix}xxx/xxx输入 \n`))
  return
}

const moduleMatch = sPath.match(/([\w_]+)\/(.+)/)
// 模块名
const moduleName = moduleMatch[1]
// 模块路径
const modulePath = moduleMatch[2]

// 创建页面
const createView = (moduleName, modulePath) => {
  // 校验页面是否已存在
  const contentView = fs.existsSync(getCurrentPath(`src/modules/${moduleName}/views/${modulePath}.vue`))

  if(contentView) {
    console.log(chalk.cyan('页面已存在，请勿重复创建！ \n'))
    return
  }

  // view模板内容
  let content = fs.readFileSync(
    getCurrentPath('template/index.vue'),
    'utf-8'
  )

  // 写入view
  const writeFile = () => {
    fs.writeFile(
      getCurrentPath(`src/modules/${moduleName}/views/${modulePath}.vue`),
      content,
      () => {
        console.log(chalk.cyan('view创建成功！ \n'))
      }
    )
  }

  const pMatch = modulePath.match(/^([^/]+)(\/[^/]+)?$/)

  if (pMatch) {
    const p = pMatch[1]
    const p2 = modulePath.indexOf('/') >= 0? `src/modules/${moduleName}/views/${p}`: `src/modules/${moduleName}/views`

    // 先创建目录，创建目录成功后创建文件
    mkdir(getCurrentPath(p2), writeFile)
  } else {
    writeFile()
  }

}

const createRouter = (moduleName, modulePath, title) => {
  // 校验页面是否已存在
  const exitRouter = fs.existsSync(getCurrentPath(`src/modules/${moduleName}/router/${modulePath}.js`))
  const exitRouterIndex = fs.existsSync(getCurrentPath(`src/modules/${moduleName}/router/index.js`))
  let contentRouterIndex = ''

  if(exitRouter) {
    console.log(chalk.cyan('路由已存在，请勿重复创建！ \n'))
    process.exit()
    return
  }

  if(exitRouterIndex) {
    contentRouterIndex = fs.readFileSync(
      getCurrentPath(`src/modules/${moduleName}/router/index.js`),
      'utf-8'
    )
    contentRouterIndex = contentRouterIndex.replace(/]/, `  ...router${modulePath.replace(/\//g, '')},\n]`)
    contentRouterIndex = contentRouterIndex.replace(/export default/, `import router${modulePath.replace(/\//g, '')} from './${modulePath}'\nexport default`)
  }else{
    contentRouterIndex += `import router${modulePath.replace(/\//g, '')} from './${modulePath}'\n`
    contentRouterIndex += 'export default [\n'
    contentRouterIndex += `  ...router${modulePath.replace(/\//g, '')},\n`
    contentRouterIndex += ']'
  }

  // 写入router
  const writeFile = () => {
    let content = ''
    content += 'export default [{\n'
    content += `  name: '${sPath.replace(/\//g, '')}',\n`
    content += `  path: '${sPath}',\n`
    content += `  component: () => import('@/modules/${moduleName}/views/${modulePath}'),\n`
    content += '  meta: {\n'
    content += `    title: '${title}',\n`
    content += '  },\n'
    content += '}]'

    fs.writeFile(
      getCurrentPath(`src/modules/${moduleName}/router/${modulePath}.js`),
      content,
      () => {
        console.log(chalk.cyan('router创建成功！ \n'))
      }
    )

    fs.writeFile(
      getCurrentPath(`src/modules/${moduleName}/router/index.js`),
      contentRouterIndex,
      () => {
        console.log(chalk.cyan('router index 创建成功！ \n'))
      }
    )
  }

  const pMatch = modulePath.match(/^([^/]+)(\/[^/]+)?$/)

  if (pMatch) {
    const p = pMatch[1]
    const p2 = modulePath.indexOf('/') >= 0? `src/modules/${moduleName}/router/${p}`: `src/modules/${moduleName}/router`

    // 先创建目录，创建目录成功后创建文件
    mkdir(getCurrentPath(p2), writeFile)
  } else {
    writeFile()
  }
}

const updateConfJSON = title => {
  const arr = sPath.split('/');
  const confPath = path.join(process.cwd(), `src/modules/${arr[0]}/conf.json`);
  let conf = {};

  try {
    conf = require(confPath);
    checkJSON(conf, arr, title, confPath);
  } catch (error) {
    mkdir(`src/modules/${arr[0]}`, () => {
      fs.writeFile(confPath, '{}', 'utf8', function(err) {
        if (err) {
          return console.log(err);
        }

        console.log('The conf.json was created!');

        checkJSON(conf, arr, title, confPath);
      });
    })
  }


};

const checkJSON = (conf, pathArr, title, confPath) => {
  const arr = Object.keys(conf);

  const secondCheck = arr.every(el => {
    return pathArr[1] !== el;
  });

  if (secondCheck) {
    conf[pathArr[1]] = {};
    conf[pathArr[1]][pathArr[2]] = {
      title
    };
  }

  conf[pathArr[1]][pathArr[2]] = {
    title
  };

  let content = JSON.stringify(conf, null, 2);

  fs.writeFile(confPath, content, 'utf8', function(err) {
    if (err) {
      return console.log(err);
    }

    console.log('The conf.json was updated!');
  });
};

rl.question('输入标题: ', title => {
  createView(moduleName, modulePath)
  // createRouter(moduleName, modulePath, title)
  updateConfJSON(title)
  setTimeout(() => {
    process.exit()
  }, 200)
})




