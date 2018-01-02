/*
 * @file
 * @desc scaffoldUtil
 * @date 2017/12/29
 *
 */

const path = require('path')
const fse = require('fs-extra')
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

module.exports = {
	scaffoldList: [],

	getFullName (scaffoldName) {
		const { fullNameMap } = getMaps(this.scaffoldList)

		return fullNameMap[scaffoldName] ? fullNameMap[scaffoldName] : scaffoldName
	},

	getShortName (scaffoldName) {
		const { shortNameMap } = getMaps(this.scaffoldList)

		return shortNameMap[scaffoldName] ? shortNameMap[scaffoldName] : scaffoldName
	},

	ensureScaffoldLatest (scaffoldName) {
		if (!this._isScaffoldExists(scaffoldName)) {
			console.log(`installing scaffold ${scaffoldName}...`)
			this.installScaffold(scaffoldName)
			console.log(`scaffold ${scaffoldName} installed successfully`)
			return;
		}

		if (!this._isScaffoldOutdate(scaffoldName)) {
			console.log(`updating scaffold ${scaffoldName}...`)
			this.installScaffold(scaffoldName)
			console.log(`scaffold ${scaffoldName} updated successfully`)
		}
	},

	_isScaffoldExists (scaffoldName) {
		const pkg = path.join(pathUtil.getScaffoldFolder(scaffoldName), 'package.json')

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

		if (latestVersion && latestVersion !== currentVersion) {
			return true
		}

		return false
	},

	installScaffold (scaffoldName) {
		
	},
}
