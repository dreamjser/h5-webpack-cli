const { Command } = require('commander')
const program = new Command()

module.exports = (cb) => {
  program
  .option('--framework <f>', '框架', 'vue')
  .option('--platform <m>', '平台', 'mobile')
  .option('--env <e>', '环境', 'dev')
  .argument('<string>', '需要构建的模块')
  .action((modules) => {
    const options = program.opts();

    process.env.currentModules = modules
    process.env.currentEnv = options.env
    process.env.currentFramework = options.framework
    process.env.currentPlatform = options.platform

    cb && cb()
  })

  program.parse()
}

