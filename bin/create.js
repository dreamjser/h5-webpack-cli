#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { Command } from 'commander'
import fileModule from '@dreamjser/file'
import { getAppConfig, getCurrentPath } from '../build/utils.js'

const appConfig = await getAppConfig()
const { mkdir } = fileModule
const program = new Command()

const getPostfixByFramework = (framework) => {
  return framework === 'vue'? 'vue': 'tsx'
}

// 创建页面
const createView = (moduleName, modulePath, framework) => {
  // 校验页面是否已存在
  const contentView = fs.existsSync(getCurrentPath(`src/modules/${moduleName}/views/${modulePath}.vue`))

  if(contentView) {
    console.log(chalk.cyan('页面已存在，请勿重复创建！ \n'))
    return
  }

  // view模板内容
  let content = fs.readFileSync(
    getCurrentPath(`template/index.${getPostfixByFramework(framework)}`),
    'utf-8'
  )

  // 写入view
  const writeFile = () => {
    fs.writeFile(
      getCurrentPath(`src/modules/${moduleName}/views/${modulePath}.${getPostfixByFramework(framework)}`),
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

const updateConfJSON = (title, sPath) => {
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

program
  .option('--framework <f>', '框架', 'vue')
  .arguments('[args...]', '需要创建的页面')
  .action((args, options) => {
    const { framework } = options
    const [path, title] = args
    if(!path) {
      console.log(chalk.yellow('请输入目录名称 \n'))
      return
    }

    if(!title) {
      console.log(chalk.yellow('请输入标题 \n'))
      return
    }

    const sPath = path

    if (sPath.indexOf(appConfig.modulePrefix) < 0 || sPath.indexOf('/') < 0) {
      console.log(chalk.yellow(`目录名称不规范，请参考${appConfig.modulePrefix}xxx/xxx输入 \n`))
      return
    }

    const moduleMatch = sPath.match(/([\w_]+)\/(.+)/)
    // 模块名
    const moduleName = moduleMatch[1]
    // 模块路径
    const modulePath = moduleMatch[2]

    createView(moduleName, modulePath, framework)
    // createRouter(moduleName, modulePath, title)
    updateConfJSON(title, sPath)

    setTimeout(() => {
      process.exit()
    }, 200)
  })

program.parse();








