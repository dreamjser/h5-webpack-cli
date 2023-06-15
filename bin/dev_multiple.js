#!/usr/bin/env node

process.env.pageType = 'multiple'

const {createDevFunc} = require('./help_dev')
const { createMultiPage } = require('../build/utils')

createDevFunc(createMultiPage)

