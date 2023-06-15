#!/usr/bin/env node
process.env.pageType = 'single'

const { createProdFunc } = require('./help_prod')
const { createRouterChildren } = require('../build/utils')


createProdFunc(createRouterChildren)
