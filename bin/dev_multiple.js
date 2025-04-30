#!/usr/bin/env node
import commander from './commander.js'
import { createMultiPage } from '../build/utils.js'

process.env.pageType = 'multiple'

commander(async () => {
  const { createDevFunc } = await import('./help_dev.js')
  createDevFunc(createMultiPage)
})


