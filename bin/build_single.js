#!/usr/bin/env node
import commander from './commander.js'
import { createRouterChildren } from '../build/utils.js'

process.env.pageType = 'single'

commander(async () => {
  const { createProdFunc } = await import('./help_prod.js')
  createProdFunc(createRouterChildren)
})



