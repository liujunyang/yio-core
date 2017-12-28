/*
 * @file
 * @desc set configs
 * @date 2017/12/26
 *
 */

// const pathUtil = require('')
const checkType = (input, expectedType) => {
    if (!Object.prototype.toString.call(input) === expectedType) {
        throw Error(`[yio-core set] config "${input}" should be an Object but received ${Object.prototype.toString.call(input)}`);
    }
}

module.exports = ({cacheFolder, configName, scaffold} = {}) => {
	console.log(96)
	if (cacheFolder) {
		checkType(cacheFolder, '[Object String]')
	}

	if (configName) {
		checkType(configName, '[Object String]')
	}

	if (scaffold) {
		checkType(scaffold, '[Object Object]')
	}
}
