/*
 * @file
 * @desc scaffoldUtil
 * @date 2017/12/29
 *
 */

const path = require('path')

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

	ensureScaffoldLatest (scaffoldName) {},
}
