/*
 * @file
 * @desc yio core command center
 * @date 2017/12/25
 *
 */

require('colors')
const path = require('path')
const fse = require('fs-extra')
const inquirer = require('inquirer')
const core = require('../core/index')

const CONFIG_FILE_NAME = '.biorc'
const CURRENT_FOLDER = process.cwd()
const isConfigExist = fse.pathExistsSync(path.join(CURRENT_FOLDER, CONFIG_FILE_NAME))

function showHelp () {
	console.log([
		`-init                  >  ${'yio init [scaffoldName]'.green}`,
		` - run                 >  ${'yio run <task> [--no-watch]'.green}`,
    ` - mock                >  ${'yio mock [port]'.green}`,
    ` - show scaffold       >  ${'yio scaffold show <scaffoldName>'.green}`,
    ` - create scaffold     >  ${'yio scaffold create'.green}`,
    ` - help                >  ${'yio help'.green}\n`,
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

      fse.ensureFileSync(npmrcPath)
      fse.writeFileSync(npmrcPath,[].join('\n'))
    }
  }
})

inquirer.prompt([
  {
    type: 'input',
    name: 'createdScaffoldName',
    message: 'Input scaffold name',
  },
]).then(answers => {
  console.log(JSON.stringify(answers, null, '  '));
});

// module.exports = commander => {
// 	console.log(99, commander)
// 	require('colors')
// }
