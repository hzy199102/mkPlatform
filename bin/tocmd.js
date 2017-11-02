#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander')
var version = require("../package.json").version
var index = require('../mk/index.js')

function log(str) {
	if (verbose) {
		console.log(str)
	}
}

program
	.version(version)
	.usage(" a node npm wrapper of hzy_mkPlatform https://github.com/hzy199102/mkPlatform ")
	.option('-f, --file [fileName]', ' Required ,can file or directory ')
	.option('-o, --open', 'open in browser')
	.option('-v, --verbose', 'log')
	.option('-t, --template [template]', 'markdown template, default [one]')
	.parse(process.argv)

var pwd = process.cwd()
var fileName = ""
var template = 'one'
var open = false
var verbose = false

if (program.file) {
	fileName = program.file
} else {
	console.log("-f is Required and exists")
	return false
}
if (program.open) {
	open = program.open
}
if (program.verbose) {
	verbose = program.verbose
}
if (program.template) {
	template = program.template
}

index({
	pwd: pwd,
	fileName: fileName,
	open: open,
	verbose: verbose
})
