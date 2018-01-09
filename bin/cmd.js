/*
 * @file
 * @desc yio core command center
 * @date 2017/12/25
 *
 */

module.exports = commander => {
  require('colors')

  const path = require('path')
  const fse = require('fs-extra')
  const inquirer = require('inquirer')
  const core = require('../core/index')

  const CONFIG_FILE_NAME = '.yiorc'
  const CURRENT_FOLDER = process.cwd()
  const IS_CONFIG_EXISTS = fse.pathExistsSync(path.join(CURRENT_FOLDER, CONFIG_FILE_NAME))

  function showHelp () {
    console.log([
      ` - init                >  ${'yio init [scaffoldName]'.green}`,
      ` - run                 >  ${'yio run <task> [--no-watch]'.green}`,
    ].join('\n'))
  }

  core.set({
    configName: CONFIG_FILE_NAME,
    scaffold: {
      registry: 'https://registry.npmjs.org/',
      list: [
        {
          shortName: 'pure',
          fullName: 'yio-scaffold-pure'
        }
      ],
      preInstall (installationDir) {
        const npmrcPath = path.join(installationDir, '.npmrc')
        console.log('core.set.preInstall'.yellow, npmrcPath)

        fse.ensureFileSync(npmrcPath)
        fse.writeFileSync(npmrcPath,[].join('\n'))
      }
    }
  })

  // inquirer.prompt([
  //   {
  //     type: 'input',
  //     name: 'createdScaffoldName',
  //     message: 'Input scaffold name',
  //   },
  // ]).then(answers => {
  //   console.log(JSON.stringify(answers, null, '  '))
  //   showHelp()
  // })

  commander
    .version('1.0.0')
    .description('init project.')
    .command('init [scaffoldName]')
    .action(scaffoldName => {
      // 没有输入 scaffoldName 的话，在init中有 inquirer
      core.init({scaffoldName})
    })

  commander
    .version('1.0.0')
    .description('run')
    .command('run <task>')
    .option('-n, --no-watch', 'watch file changes')
    .action((task, options) => {
      const {watch} = options

      if (!IS_CONFIG_EXISTS) {
        core.init().then(() => {
          core.scaffold.run(task, {watch})
        })
      } else {
        core.scaffold.run(task, {watch})
      }

    })

  commander.parse(process.argv)

  if (!commander.args.length) {
    showHelp()
  }
}
