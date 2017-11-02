'use strict'

require('shelljs/global')

var fs = require('fs')
var BufferHelper = require('bufferhelper')
var Handlebars = require('handlebars')
var marked = require('marked')
var open = require("open")

function tocmd(options) {
	var verbose = options.verbose
	var open = options.open
	var pwd = options.pwd
	var fileName = options.fileName
	var template = options.template
	var sourceFile = pwd + "/" + fileName
	var fileType = "file"
	function log(str) {
		if (verbose) {
			console.log(str)
		}
	}

	// 目录
    if (test('-e', sourceFile)) {
        if (test('-d', sourceFile)) {
            fileType = 'directory'
        }
    } else {
        console.log("-f is Required and exists")
        return false
	}


	log('pwd=' + pwd)
	log('fileName = ' + fileName)
	log('fileType = ' + fileType)
	log('open = ' + open)

	// 点号表示当前文件所在路径  
	// var str = fs.realpathSync('.')

	// 预览文件地址
	var previewPath = pwd + '/preview'


}

module.exports = tocmd