/*
 * @file
 * @desc networkUtil
 * @date 2017/12/29
 *
 */

const dns = require('dns')
const getPort = require('get-port')
const URL = require('url-parse')

module.exports = {
	_getPort: function* (defaultPort) {
		return getPort(defaultPort)
	},

	getFreePort: function* (defaultPort) {
		const finalPort = yield this._getPort(defaultPort)

		if (finalPort !== defaultPort) {
			return yield this.getFreePort(defaultPort + 1)
		}

		return defaultPort
	},
}
