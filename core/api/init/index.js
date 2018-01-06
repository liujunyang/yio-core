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
	console.log('init.index.writeConfigFile'.yellow, configFileName)

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

function getTemplateDirPath (scaffoldName) {
	return new Promise((resolve, reject) => {
		const scaffoldFolder = pathUtil.getScaffoldFolder(scaffoldName)
		const demoFolder = path.join(scaffoldFolder, 'project-template')

		console.log('init.index.getTemplateDirPath'.yellow, demoFolder)
		const templateNames = []

		if (fse.pathExistsSync(demoFolder)) {
			fse.readdirSync(demoFolder).forEach(fileName => {
				templateNames.push(fileName)
			})
		}

		if (templateNames.length === 0) {
			resolve('')
		} else if (templateNames.length === 1) {
			resolve(path.join(demoFolder, templateNames[0]))
		} else {
			resolve(inquirer.prompt([
		    {
		      type: 'list',
		      name: 'chosen',
		      message: 'choose demo',
		      choices: templateNames,
		    }
		  ]).then(answers => {
		  	let chosenTemplateName = answers.chosen

		  	console.log('\n the chosen demo: ', chosenTemplateName.green)
		    return path.join(demoFolder, chosenTemplateName)
		  }))
		}
	})
}

function* downloadTemplate (cwd, scaffoldName) {
	scaffoldUtil.ensureScaffoldLatest(scaffoldName)

	const targetTemplateDirPath = yield getTemplateDirPath(scaffoldName)
	console.log('init.index.downloadTemplate'.yellow, targetTemplateDirPath)

	if (targetTemplateDirPath === '') {
		console.log(`Scaffold ${scaffoldName} does not have demo files, please contact the scaffold author to add demo files.`.yellow)
		return;
	}

	// 把示例 targetTemplateDirPath 下的文件复制过来，不包含 targetTemplateDirPath 文件夹本身
	fse.copySync(targetTemplateDirPath, cwd, {
		overwrite: true,
		errorOnExist: false,
	})
}

module.exports = ({ignored = [pathUtil.configName, /readme\.md/i], scaffoldName = ''} = {}) => {
	const cwd = process.cwd()
	console.log('init.index.exports'.yellow, cwd)

	return co(function* init() {
		let chosenScaffoldName = scaffoldName

		if (!chosenScaffoldName) {
			chosenScaffoldName = yield choseScaffold()
		}

		const fullScaffoldName = scaffoldUtil.getFullName(chosenScaffoldName)

		writeConfigFile({scaffoldName: fullScaffoldName, cwd})

		if (fileUtil.isEmptyDir({dir: cwd, ignored})) {
			console.log('init.index.exports.isEmptyDir'.yellow, cwd)
			yield downloadTemplate(cwd, fullScaffoldName)
			fileUtil.renameInvisableFiles(cwd)
		}

		console.log('\nInit project successfully!\n');
	})
}
