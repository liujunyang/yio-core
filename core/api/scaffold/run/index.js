/*
 * @file
 * @desc scaffold run
 * @date 2018/01/06
 *
 */

const co = require('co')
const ora = require('ora')
const md5 = require('md5')
const path = require('path')
const ps = require('ps-node')
const fse = require('fs-extra')
const killPort = require('kill-port')
const findProcess = require('find-process')
const syncDirectory = require('sync-directory')

const pathUtil = require('../../../tool/path')
const network = require('../../../tool/network')
const scaffoldUtil = require('../../../tool/scaffold')

require('child-process-close')

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

function runScaffold ({taskName, cwd, workspaceFolder, scaffoldName, debugPort}) {
	console.log(900)
	const scaffoldFolder = pathUtil.getScaffoldFolder(scaffoldName)
	const child = require('child_process').fork('./yio-entry.js', [
			`taskName=${taskName}`,
			`userDir=${cwd}`,
			`srcDir=${workspaceFolder}`,
			`distDir=${path.join(cwd, './build')}`,
			`port=${debugPort}`,
		], {
		cwd: scaffoldFolder,
		silent: true
	})

	child.stdout.setEncoding('utf8')
	child.stdout.on('data', (data) => {
		if (data) {
			console.log(data.toString())
		}
	})

	child.stderr.on('data', (data) => {
		if (data) {
			console.log(data.toString())
		}
	})

	return child
}

function* killPreProcess () {
	const preProcessRecordFile = path.join(pathUtil.cacheFolder, 'pre-process-record.json')

	if (!fse.pathExistsSync(preProcessRecordFile)) {
		return;
	}

	const map = require(preProcessRecordFile)
	const obj = map[md5(process.cwd())]

	if (!obj) {
		return;
	}

	const killPro = pid => {
		return new Promise(resolve => {
			ps.kill(pid, () => {
				resolve(`kill pid ${pid} done.`)
			})
		})
	}

	const _killport = port => {
		return new Promise(resolve => {
			findProcess('port', port).then((list) => {
				if (list[0] && list[0].cmd && list[0].cmd.split(' ').indexOf(`userFolder=${process.cwd()}`) !== -1) {
					killPort(port).then(() => {
						resolve(`kill port ${port} done.`)
					}).catch(() => {
						resolve(`kill port ${port} done.`)
					});
				} else {
					resolve(`kill port ${port} done.`)
				}
			});
		})
	}

	const {main: mainId, children} = obj

	for (let i = 0; i < children.length; i++) {
		const item = children[i]

		if (item.pro) {
			yield killPro(item.pid)
		}

		if (item.port) {
			yield _killport(item.port)
		} else if (item.ports) {
			for (let j = 0; j < item.ports.length; j++) {
				yield _killport(item.ports[j])
			}
		}
	}

	yield killPro(mainId)
}

function recordPreProcess (main, children) {
	const preProcessRecordFile = path.join(pathUtil.cacheFolder, 'pre-process-record.json');

	fse.ensureFileSync(preProcessRecordFile)

	const obj = {};
	obj[md5(process.cwd())] = {
		main,
		children,
	};

	fse.writeFileSync(preProcessRecordFile, JSON.stringify(obj));
}

module.exports = (taskName, {configName = pathUtil.configName, watch = true} = {}) => {
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

		yield killPreProcess()

		const debugPort = yield network.getFreePort(9000)
		console.log(`\nscaffold: ${scaffoldUtil.getShortName(scaffoldName).green}; task: ${taskName.green}; port: ${debugPort}\n`)

		const scaffoldProcess = runScaffold({
			taskName,
			cwd,
			workspaceFolder,
			scaffoldName,
			debugPort,
		})

		recordPreProcess(process.pid, [{
			pid: scaffoldProcess.pid,
			ports: [debugPort]
		}])

		function afterKillPort () {
			try {
				process.kill(scaffoldProcess.pid)
			} catch (e){}

			wacher && wacher.close()
			process.exit()
		}

		// 用户按下 ctrl + c
		process.on('SIGINT', () => {
			killPort(debugPort)
				.then(afterKillPort)
				.catch(afterKillPort)
		})
	})
}


















