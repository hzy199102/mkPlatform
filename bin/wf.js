#!/usr/bin/env node

/**
 * Module dependencies.
 */
var program = require('commander')
var fs = require('fs')
var version = require("../package.json").version
var index = require('../cmd/wf/index.js')

var pwd = process.cwd()
var verbose = false
var folderName = ""
var destPath = ""
function log(str) {
    if (verbose) {
        console.log(str)
    }
}

program
    .version(version)
    .usage(" a node npm wrapper of hzy_mkPlatform https://github.com/hzy199102/mkPlatform ")
    .option('-f, --folder [folderName]', ' Required ')
    .option('-v, --verbose', '打印详细日志')
    .option('-d, --destPath [destPath]', ' default [current directory / result.js]')
    .parse(process.argv)


if (program.folder) {
    folderName = program.folder
} else {
    console.log("-f is Required")
    return false
}
if (program.verbose) {
    verbose = program.verbose
}
if (program.destPath) {
    destPath = program.destPath
} else {
    destPath = pwd + "/result.txt"
}

index({
    pwd: pwd,
    folderName: folderName,
    destPath: destPath,
    verbose: verbose
})