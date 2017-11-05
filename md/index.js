'use strict'

require('shelljs/global')

var fs = require('fs')
var BufferHelper = require('bufferhelper')
var Handlebars = require('handlebars')
var marked = require('marked')
var _open = require("open")

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

	/**
	 * 生成目标文件html
	 * @param params
	 * sourceFile: 源文件
	 * templatePath： 模板路径
	 * title: 文件名称
	 * destPath: 预览地址
	 * open: 是否开启浏览器
     */
	function dest(params) {
		fs.readFile(params.sourceFile, function (err, data) {
			if (err) throw err

			// var rs = fs.createReadStream(template_path, {encoding: 'utf-8', bufferSize: 11})
			// bufferSize 是缓冲区的大小，大小设置适中就好
			var rs = fs.createReadStream(params.templatePath + "/template.html", { bufferSize: 11 })
			var bufferHelper = new BufferHelper()

			rs.on("data", function (trunk) {
				bufferHelper.concat(trunk)
			})

			rs.on("end", function () {
				var source = bufferHelper.toBuffer().toString('utf8')
				var template = Handlebars.compile(source)
				// marked = require('gulp-markdown-livereload')
				marked(data.toString(), {
					langPrefix: 'hljs lang-',
					highlight: function (code) {
						return require('highlight.js').highlightAuto(code).value
					}
				}, function (err, data) {
					if (err) throw err

					var final_html_content = new Buffer(template({
						"title": "hzy_toc:" + params.title,
						"parse_markdown": data
					}))

					fs.writeFile(params.destPath, final_html_content, function (err) {
						if (err) throw err
						log('It\'s saved!')

						if (params.open == true) {
							_open(params.destPath)
						}
					})
				})
			})
		})
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
	// 模板文件地址
	var templatePath = pwd + '/factory/' + template

	// 复制模板
	//cp('-R', templatePath, previewPath)

	if (fileType === 'file') {
		var title = fileName.split('/').pop().split('.')[0]
		// markdown文件引用的本地资源文件地址
		//var assetsPath = pwd + '/assets/' + title
		// 复制markdown文件引用的本地资源文件
		//cp('-R', assetsPath, previewPath + "/assets")
		dest({
			sourceFile: sourceFile,
			templatePath: templatePath,
			title: title,
			destPath: previewPath + "/" + title + ".html",
			open: options.open
		})
	} else if (fileType === 'directory') {
		//console.log("this is a directory, to be continued")
		fs.readdir(sourceFile, function (err, files) {
			if (err) {
				throw err
			}
			for (var i = 0; i < files.length; i++) {
				var title = files[i].split('.')[0]
				dest({
					sourceFile: sourceFile + "/" + files[i],
					templatePath: templatePath,
					title: title,
					destPath: previewPath + "/" + title + ".html",
					open: options.open
				})
			}
		})
	}
}

module.exports = tocmd