#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander')
var version = require("../package.json").version

program
	.version(version)
	.usage(" a node npm wrapper of hzy_mkPlatform https://github.com/hzy199102/mkPlatform ")
	.option('-f, --file [filename]', ' Required ')
	.option('-o, --open', 'open in browser')
	.option('-v, --verbose', '打印详细日志')
	.parse(process.argv)

var pwd = process.cwd()
var filename = "README.md"
var is_open = false

if (program.file) {
	filename = program.file
}

if (program.open) {
	is_open = program.open
}

var verbose = false
if (program.verbose) {
	verbose = program.verbose
}

var _verbose = verbose
function log(str) {
	if (_verbose == true) {
		console.log(str)
	}
}

log('filename = ' + filename)
log('verbose = ' + verbose)

var source_file = filename

var markd_config = {
	debug: false
}

var source_file_name = pwd + '/' + source_file
var file_name = source_file_name.split('/').pop()
var _file_name = file_name.split('.')[0]

if (file_name.indexOf('\\') > 0) {
	_file_name = file_name.substring(file_name.lastIndexOf("\\")).split('.')[0]
}
var dest_file_path = pwd + '/preview/' + _file_name + '.html'

log('pwd=' + pwd)
log('source_file_name=' + source_file_name)
log('file_name=' + file_name)
log('_file_name=' + _file_name)
log('dest_file_path=' + dest_file_path)

require('../index')(pwd, source_file_name, dest_file_path, is_open, markd_config)
