/*
 * @file
 * @desc API
 * @date 2017/12/26
 *
 */

module.exports = {
	set: require('./api/set/index'),
	init: require('./api/init/index'),
	scaffold: {
		run: require('./api/scaffold/run/index'),
	},
}
