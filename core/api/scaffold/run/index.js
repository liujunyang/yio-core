/*
 * @file
 * @desc scaffold run
 * @date 2018/01/06
 *
 */

const co = require('co')
const ora = require('ora')
const path = require('path')
const fse = require('fs-extra')
const syncDirectory = require('sync-directory')

const pathUtil = require('../../../tool/path')
const scaffoldUtil = require('../../../tool/scaffold')


function checkConfig (cwd, configName) {
	const configFile = path.join(cwd, configName)

	if (!fse.pathExistsSync(configFile)) {
		throw new Error(`${configName} not found in current dir.`)
	}

	try {
		JSON.parse(fse.readFileSync(configFile).toString())
	} catch (e) {
		throw new Error(`Failed to read ${configName}, please check this file is JSON formatted`, e)
	}
}

function getScaffoldName (configFile) {
	return JSON.parse(fse.readFileSync(configFile).toString()).scaffold
}

function checkScaffoldExist (configFile, configName) {
	const scaffoldName = getScaffoldName(configFile)

	if (!scaffoldName) {
		throw new Error(`key "scaffold" not found in ${configName}, please check.`)
	}
}

function runSyncDirectory (from, to, {watch}) {
	const spinner = ora('file synchronization running...').start()

	const watcher = syncDirectory(from, to, {
		watch,
		type: 'hardlink',
		// 第二个参数其实是 .yio 文件夹名
		exclude: [/((\.git)|(\.DS_Store))/i, pathUtil.cacheFolder.replace(/\/$/, '').split('/').pop()],
	})

	spinner.succeed('file synchronization done.').stop()

	return watcher
}

module.exports = (currentEnv, {configName = pathUtil.configName, watch = true} = {}) => {
	co(function* () {
		const cwd = process.cwd()
		const configFile = path.join(cwd, configName)

		checkConfig(cwd, configName)
		checkScaffoldExist(configFile, configName)

		const scaffoldName = scaffoldUtil.getFullName(getScaffoldName(configFile))
		const workspaceFolder = pathUtil.getWorkspaceFolder({cwd, scaffoldName})
		console.log('api.scaffold.run.exports'.yellow, workspaceFolder)

		scaffoldUtil.ensureScaffoldLatest(scaffoldName)

		const watcher = runSyncDirectory(cwd, workspaceFolder, { watch });
	})
}


















