#!/usr/bin/env node
import commander from './commander.js'
import { createMultiPage } from '../build/utils.js'

process.env.pageType = 'multiple'

commander(async () => {
  const { createProdFunc } = await import('./help_prod.js')
  createProdFunc(createMultiPage)
})



