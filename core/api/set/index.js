/*
 * @file
 * @desc set configs
 * @date 2017/12/26
 *
 */

const npmUtil = require('../../tool/npm')
const pathUtil = require('../../tool/path')
const scaffoldUtil = require('../../tool/scaffold')
const checkType = (input, expectedType) => {
    if (!Object.prototype.toString.call(input) === expectedType) {
        throw Error(`[yio-core set] config "${input}" should be an Object but received ${Object.prototype.toString.call(input)}`);
    }
}

module.exports = ({cacheFolder, configName, scaffold} = {}) => {
	if (cacheFolder) {
		checkType(cacheFolder, '[Object String]')
		pathUtil.cacheFolder = cacheFolder
	}

	if (configName) {
		checkType(configName, '[Object String]')
		pathUtil.configName = configName
	}

	if (scaffold) {
		checkType(scaffold, '[Object Object]')

		if (scaffold.registry) {
			npmUtil.scaffoldRegistry = scaffold.registry
		}

		if (scaffold.preInstall) {
			scaffoldUtil.preInstall = scaffold.preInstall.bind(scaffoldUtil)
		}

		if (scaffold.list && scaffold.list.length) {
			let formattedScaffoldList = []

			scaffold.list.forEach(item => {
				formattedScaffoldList.push({
					name: item.shortName,
					value: item.shortName,
					fullName: item.fullName,
				})
			})

			scaffoldUtil.scaffoldList = formattedScaffoldList
		}
	}
}
