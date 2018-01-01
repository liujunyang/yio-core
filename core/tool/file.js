/*
 * @file
 * @desc fileUtil
 * @date 2018/01/01
 *
 */

const path = require('path')
const fse = require('fs-extra')

module.exports = {
	writeFileSync (filePath, content) {
		fse.ensureFileSync(filePath)
    fse.writeFileSync(filePath, content)
	},

	isEmptyDir ({dir, ignored} = {}) {
		const defaultIgnored = /(\.git)|(\.idea)|(\.ds_store)|(readme\.md)|(\.npm)/i;

		let isEmpty = true;

		fse.readdirSync(dir).forEach((filename) => {
			if (defaultIgnored.test(filename)) {
				return;
			}

			if (ignored) {
				const type = Object.prototype.toString.call(ignored)

				if (type === '[object RegExp]') {
					if (ignored.test(filename)) {
						return;
					}
				} else if (type === '[object String]') {
					if (ignored === filename) {
						return;
					}
				} else if (type === '[object Array]') {
					for (let i = 0; i < ignored.length; i += 1) {
						const itemType = Object.prototype.toString.call(ignored[i])

						if (itemType === '[object RegExp]') {
							if (ignored[i].test(filename)) {
								return;
							}
						} else if (itemType === '[object String]') {
							if (ignored[i] === filename) {
								return;
							}
						}
					}
				}
			}

			isEmpty = false
		})

		return isEmpty
	},

	renameInvisableFiles(dir) {
    // rename files like gitignore/npmrc/npmignor to .gitignore/.npmrc/.npmignor
    const arr = fse.readdirSync(dir)

    arr.forEach((filename) => {
    	if (/^((gitignore)|(npmrc)|(npmignore))$/.test(filename)) {
    		const src = path.join(dir, filename)
    		const target = path.join(dir, `.${filename}`)

    		if (!fse.pathExistsSync(target)) {
    			try {
    				fse.moveSync(src, target)
    			} catch (err) {
    				console.log(err)
    			}
    		}
    	}
    });
  },
}
