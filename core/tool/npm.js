/*
 * @file
 * @desc npmUtil
 * @date 2017/12/29
 *
 */

const registryUrl = require('registry-url')

module.exports = {
	// default registry url, can be rewritten
	scaffoldRegistry: registryUrl(),
}
