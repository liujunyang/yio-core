/*
 * @file
 * @desc yio core command center
 * @date 2017/12/25
 *
 */

require('colors')
console.log('99'.green)

const path = require('path')
const fse = require('fs-extra')
const inquirer = require('inquirer')
const core = require('../core/index')

const CONFIG_FILE_NAME = '.biorc'
const CURRENT_FOLDER = process.cwd()
const isConfigExist = fse.pathExistsSync(path.join(CURRENT_FOLDER, CONFIG_FILE_NAME))

console.log(isConfigExist)

function showHelp () {
	console.log([
		`-init       > ${'yio init [scaffoldName]'.green}`,
	].join('\n'))
}

showHelp()
core.set()

// module.exports = commander => {
// 	console.log(99, commander)
// 	require('colors')
// }
