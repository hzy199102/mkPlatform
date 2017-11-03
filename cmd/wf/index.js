'use strict'

require('shelljs/global')

var fs = require('fs')
var BufferHelper = require('bufferhelper')

/**
 *
 * @param options
 * verbose: 是否开启日志
 * destPath：目标文件地址
 * pwd：程序当前运行所在目录
 * folderName： 程序处理的文件夹名称
 */
function wf(options) {
	var verbose = options.verbose
	var destPath = options.destPath
	var pwd = options.pwd
	var folderName = options.folderName
	function log(str) {
		if (verbose) {
			console.log(str)
		}
	}

	log('pwd=' + pwd)
	log('folderName = ' + folderName)
	log('destPath = ' + destPath)

	fs.readdir(pwd + '/' + folderName, function (err, files) {
		if (err) {
			throw err
		}
		var content = ''
		var temp = ''
		for (var i = 0; i < files.length; i++) {
			var x = files[i].split('.')[0]
			temp += ("'wx_" + x + "', ")
			// grin: require('./assets/face/Face001.png'),
			content += 'wx_' + x + ": require('./assets/wx_face/" + files[i] + "'),\r\n"
			// scream: require('../renderer/assets/face/Face022.png'),
			//console.log('wx_' + x + ": require('../renderer/assets/wx_face/" + files[i] + "'),")
		}
		content += temp
		fs.writeFile(destPath, content, {
			flag: 'w'
		}, function (err) {
			if (err) throw err
			log('It\'s saved!')
		})
	})
}

module.exports = wf