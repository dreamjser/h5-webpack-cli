#!/usr/bin/env node
process.env.pageType = 'single'

const commander = require('./commander')
const { createRouterChildren } = require('../build/utils')

commander(() => {
  const {createDevFunc} = require('./help_dev')
  createDevFunc(createRouterChildren)
})

