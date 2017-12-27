/*
 * @file
 * @desc set configs
 * @date 2017/12/26
 *
 */

const checkType = (input, expectedType) => {
    if (!Object.prototype.toString.call(input) === expectedType) {
        throw Error(`[yio-core set] config "${input}" should be an Object but received ${Object.prototype.toString.call(input)}`);
    }
}

module.exports = () => {
	console.log(96)
}
