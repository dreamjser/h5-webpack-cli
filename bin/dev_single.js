#!/usr/bin/env node

import commander from './commander.js'
import { createRouterChildren } from '../build/utils.js'

process.env.pageType = 'single'

commander(async () => {
  const { createDevFunc } = await import('./help_dev.js')
  createDevFunc(createRouterChildren)
})
