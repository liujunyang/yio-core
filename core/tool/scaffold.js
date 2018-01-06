/*
 * @file
 * @desc scaffoldUtil
 * @date 2017/12/29
 *
 */

const path = require('path')
const fse = require('fs-extra')
const mergeDirs = require('merge-dirs')
const getVersion = require('get-version-l')

const npmUtil = require('./npm')
const pathUtil = require('./path')

const getMaps = (() => {
	let shortNameMap = null
	let fullNameMap = null

	return scaffoldList => {
		if (shortNameMap && fullNameMap) {
			return {shortNameMap, fullNameMap}
		}

		shortNameMap = {}
		fullNameMap = {}

		scaffoldList.forEach(item => {
			shortNameMap[item.fullName] = item.value
			fullNameMap[item.value] = item.fullName
		})

		return {shortNameMap, fullNameMap}
	}
})()

const createExecPackageJsonFile = (execInstallFolder, scaffoldName) => {
	const pkg = path.join(execInstallFolder, 'package.json')

	fse.ensureFileSync(pkg)
	fse.writeFileSync(pkg, JSON.stringify({
		name: `installing-${scaffoldName}`,
		version: '1.0.0',
	}))
}

module.exports = {
	scaffoldList: [],

	preInstall (execInstallFolder) {
	},

	getFullName (scaffoldName) {
		const { fullNameMap } = getMaps(this.scaffoldList)

		return fullNameMap[scaffoldName] ? fullNameMap[scaffoldName] : scaffoldName
	},

	getShortName (scaffoldName) {
		const { shortNameMap } = getMaps(this.scaffoldList)

		return shortNameMap[scaffoldName] ? shortNameMap[scaffoldName] : scaffoldName
	},

	ensureScaffoldLatest (scaffoldName) {
		console.log('tool.scaffold.ensureScaffoldLatest'.yellow, scaffoldName)
		if (!this._isScaffoldExists(scaffoldName)) {
			console.log(`installing scaffold ${scaffoldName}...`)
			this.installScaffold(scaffoldName)
			console.log(`scaffold ${scaffoldName} installed successfully`)
			return;
		}

		if (this._isScaffoldOutdate(scaffoldName)) {
			console.log(`updating scaffold ${scaffoldName}...`)
			this.installScaffold(scaffoldName)
			console.log(`scaffold ${scaffoldName} updated successfully`)
		}
	},

	_isScaffoldExists (scaffoldName) {
		const pkg = path.join(pathUtil.getScaffoldFolder(scaffoldName), 'package.json')
		console.log('tool.scaffold._isScaffoldExists'.yellow, pkg)

		if (!fse.pathExistsSync(pkg)) {
			console.log(`\n${scaffoldName}/package.json is not found at local\n`)
			return false
		}

		return true
	},

	_isScaffoldOutdate (scaffoldName) {
		const pkg = path.join(pathUtil.getScaffoldFolder(scaffoldName), 'package.json')
		const currentVersion = require(pkg).version
		const latestVersion = getVersion(scaffoldName)

		console.log('tool.scaffold._isScaffoldOutdate'.yellow, currentVersion, latestVersion)

		if (latestVersion && latestVersion !== currentVersion) {
			console.log('_isScaffoldOutdate true')
			return true
		}

		return false
	},

	installScaffold (scaffoldName) {
		const execInstallFolder = pathUtil.getScaffoldExecInstallFolder(scaffoldName)
		const scaffoldFolder = pathUtil.getScaffoldFolder(scaffoldName)
		const scaffoldWrapper = pathUtil.getScaffoldWrapper(scaffoldName)

		console.log('execInstallFolder:', execInstallFolder)
		console.log('scaffoldFolder:', scaffoldFolder)

		createExecPackageJsonFile(execInstallFolder, scaffoldName)

		this.preInstall(execInstallFolder)

		require('child_process').exec(`cd ${execInstallFolder} && npm --registry ${npmUtil.scaffoldRegistry} install ${scaffoldName}@latest`, {
			stdio: 'inherit'
		})

		// 虽然下面也可以把模块挪到目标位置，但是 overwrite 可能遗留覆盖不了的文件，在这里整体删除
		if (fse.pathExistsSync(scaffoldFolder)) {
			fse.removeSync(scaffoldFolder)
		}

		fse.moveSync(path.join(execInstallFolder, 'node_modules', scaffoldName), scaffoldFolder, {overwrite: true})

		// 在 npm5 3 不同版本，模块依赖可能和模块本身平级平铺，这里的作用是把可能平铺的依赖放进模块的 node_modules 子文件夹
		console.log('merging node_modules...')
		mergeDirs.default(path.join(execInstallFolder, 'node_modules'), path.join(scaffoldFolder, 'node_modules'), 'overwrite');
		console.log('merging node_modules done')

		fse.removeSync(execInstallFolder)
	},
}
