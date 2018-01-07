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

	getWorkspaceFolder ({cwd, scaffoldName}) {
		console.log(90,path.dirname(cwd))
		const currentDirName = cwd.replace(path.dirname(cwd), '').replace(/^\//, '').replace(/\/$/, '')
		const scaffoldFolder = this.getScaffoldFolder(scaffoldName)
		const workspaceFolder = path.join(scaffoldFolder, 'workspace', md5(cwd), currentDirName)
		console.log(91, cwd, currentDirName)
		console.log(92, scaffoldFolder)
		console.log(93, workspaceFolder)
		return workspaceFolder
	},
}
