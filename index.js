/*
 * @file
 * @desc yio core entry
 * @date 2017/12/20
 *
 */

module.exports = (commander) => {
	require('./bin/cmd')(commander)
}
