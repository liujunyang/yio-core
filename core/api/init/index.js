/*
 * @file
 * @desc init scaffold project
 * @date 2017/12/31
 *
 */

const co = require('co')
const path = require('path')
const fse = require('fs-extra')
const inquirer = require('inquirer')

const fileUtil = require('../../tool/file')
const pathUtil = require('../../tool/path')
const scaffoldUtil = require('../../tool/scaffold')

function writeConfigFile ({scaffoldName, cwd}) {
	const configFileName = path.join(cwd, pathUtil.configName)

	fileUtil.writeFileSync(configFileName, JSON.stringify({
		scaffold: scaffoldName
	}, null, '  '))
}

function choseScaffold () {
	return inquirer.prompt([
    {
      type: 'list',
      name: 'scaffoldName',
      message: 'select init style',
      choices: scaffoldUtil.scaffoldList,
    }
  ]).then(answers => {
    return scaffoldUtil.getFullName(answers.scaffoldName)
  })
}

function* downloadTemplate (cwd, scaffoldName) {
	scaffoldUtil.ensureScaffoldLatest(scaffoldName)
}

module.exports = ({ignored = [pathUtil.configName, /readme\.md/i], scaffoldName = ''} = {}) => {
	const cwd = process.cwd()

	return co(function* init() {
		let chosenScaffoldName = scaffoldName

		if (!chosenScaffoldName) {
			chosenScaffoldName = yield choseScaffold()
		}

		const fullScaffoldName = scaffoldUtil.getFullName(chosenScaffoldName)

		writeConfigFile({scaffoldName: fullScaffoldName, cwd})

		if (fileUtil.isEmptyDir({dir: cwd, ignored})) {
			console.log(900)
			yield downloadTemplate(cwd, fullScaffoldName)
			fileUtil.renameInvisableFiles(cwd)
		}

		console.log('\nInit project successfully!\n');
	})
}
