#!/usr/bin/env node

process.env.pageType = 'multiple'

const { createProdFunc } = require('./help_prod')
const { createMultiPage } = require('../build/utils')


createProdFunc(createMultiPage)

