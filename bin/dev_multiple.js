#!/usr/bin/env node

process.env.pageType = 'multiple'

const commander = require('./commander')
const { createMultiPage } = require('../build/utils')

commander(() => {
  const {createDevFunc} = require('./help_dev')
  createDevFunc(createMultiPage)
})


