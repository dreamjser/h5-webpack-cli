#!/usr/bin/env node
process.env.pageType = 'single'

const commander = require('./commander')
const { createRouterChildren } = require('../build/utils')

commander(() => {
  const {createProdFunc} = require('./help_prod')
  createProdFunc(createRouterChildren)
})



