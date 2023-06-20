#!/usr/bin/env node
process.env.pageType = 'single'

const { Command } = require('commander')
const program = new Command()
const {createDevFunc} = require('./help_dev')
const { createRouterChildren } = require('../build/utils')

program
  .option('--framework <f>', '框架', 'vue')
  .option('--platform', '平台', 'mobile')
  .option('--env', '环境', 'dev')
  .argument('<string>', '需要构建的模块')
  .action((modules) => {
    const options = program.opts();

    process.env.currentModules = modules
    process.env.currentEnv = options.env
    process.env.currentFramework = options.currentFramework
    process.env.currentPlatform = options.platform

    createDevFunc(createRouterChildren)
  })

program.parse();


