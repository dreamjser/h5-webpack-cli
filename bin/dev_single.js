#!/usr/bin/env node

process.env.pageType = 'single'

const {createDevFunc} = require('./help_dev')
const { createRouterChildren } = require('../build/utils')

createDevFunc(createRouterChildren)

