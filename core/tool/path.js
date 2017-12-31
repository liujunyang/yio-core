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
	cacheFolder: path.join(process.env.HOME, '.yio')
}
