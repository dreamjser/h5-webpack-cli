#!/usr/bin/env node
process.env.pageType = 'single'

const { Command } = require('commander')
const program = new Command()
const { createRouterChildren } = require('../build/utils')

program
  .option('--framework <f>', '框架', 'vue')
  .option('--platform <p>', '平台', 'mobile')
  .option('--env <e>', '环境', 'dev')
  .argument('<string>', '需要构建的模块')
  .action((modules) => {
    const options = program.opts();

    process.env.currentModules = modules
    process.env.currentEnv = options.env
    process.env.currentFramework = options.framework
    process.env.currentPlatform = options.platform

    const {createProdFunc} = require('./help_prod')

    createProdFunc(createRouterChildren)
  })

program.parse();


