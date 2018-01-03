/*
 * @file
 * @desc pathUtil
 * @date 2017/12/29
 *
 */

const path = require('path')
const md5 = require('md5')

module.exports = {
	// console.log('path')
	configName: '.yiorc',
	cacheFolder: path.join(process.env.HOME, '.yio'),

	getScaffoldWrapper (scaffoldName) {
		return path.join(this.cacheFolder, 'scaffold')
	},

	getScaffoldFolder (scaffoldName) {
		return path.join(this.getScaffoldWrapper(scaffoldName), scaffoldName)
	},

	getScaffoldExecInstallFolder (scaffoldName) {
		return path.join(this.getScaffoldWrapper(scaffoldName), 'tmp-install-cache', md5(scaffoldName))
	},
}
