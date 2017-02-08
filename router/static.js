'use strict';

/**
 * 静态化业务逻辑
 * Author: luolei@yuewen.com
 */

const koa = require('koa');
const router = require('koa-router')();
const views = require('co-views');
const chalk = require('chalk');
const request = require('co-request');
const parse = require('co-body');
const dateFormat = require('dateformat');
const _ = require('lodash');
const cookies = require('cookie');

const serverDetective = require('../lib/serverDetective');
const NODE_ENV = serverDetective.getEnv();
const SITE_CONF = serverDetective.getSiteConf();
const serverConf = serverDetective.getServerConf(); //获得路由
const staticRouterMap = serverDetective.getStaticRouterMapConf();
const domainMap = serverDetective.getDomainMap(); //获得域名映射表
const templatePathPrefix = serverConf['views']['path_prefix'] || "local";
const staticConf = serverConf['static'];
const Monitor = require("../lib/monitor");



const fs = require('co-fs');
const minify = require('html-minifier').minify;

const STATIC_OUTPUT_PATH = serverConf.index;


/**
 * 压缩配置
 */

var minifyConf = {
	"removeAttributeQuotes": "false",
	"removeComments": "true", //去除评论
	"collapseWhitespace": "true", //删除空格
	"collapseInlineTagWhitespace": "true", //删除行内属性空格
	"minifyCSS": "false", //压缩行内css
	"minifyJS": "false" //压缩行内js
}

/**
 * /api/v2/setData/:val 接口
 */
var configRouter = function(val) {

	return function* customeRoutersHandler(next) {

		console.log('*******START*********');
		var that = this;
		var result = that.request.body; //获得和解析post请求的json数据

		var _routerVal = val;
		var _staticPathVal = staticRouterMap[_routerVal].static; //获得待生成静态文件绝对路径
		var _viewsPathVal = staticRouterMap[_routerVal].views;

		_viewsPathVal = _viewsPathVal.replace('.html', '');

		//默认传给模板全局变量
		result.envType = NODE_ENV;
		result.staticConf = staticConf;

		// 静态化服务没有cookie
		this.state.cookie = undefined;
		this.state.CLIENT_COOKIE = undefined;
		/**
		 * 透传服务器环境变量和静态资源配置
		 */

		console.log('当前接口:' + _routerVal);
		console.log('待生成文件相对路径:' + JSON.stringify(_staticPathVal));
		console.log('当前的读取模板:' + _viewsPathVal);
		//默认封装一个全局性的<%= pageUpdateTime %> 变量供静态页面标记更新时间用
		var _fileUpdateTimeStamp = result.timeStamp ? result.timeStamp : (new Date()).getTime();
		result.pageUpdateTime = dateFormat(_fileUpdateTimeStamp, "yyyy-mm-dd,HH:MM:ss");
		console.log('接口更新时间:' + result.pageUpdateTime);

		//过滤不存在的路径
		var _splitStaticPath = _staticPathVal.split('/');
		var _splitStaticPathExtract = _.filter(_splitStaticPath, function(n) {
			return n !== '';
		})

		_splitStaticPathExtract = _.dropRight(_splitStaticPathExtract);
		var _staticFilePathRaw = _splitStaticPathExtract.join('/');


		//获得最终生成的文件名,强制要求均以index.html或者fileName.html结尾
		var _staticFileName = _.takeRight(_splitStaticPath)[0];
		//获得html文件名,后续做标记用
		var _staticFileNameRaw = _staticFileName.split('.html')[0];
		//处理静态化的文件名,如果未标注.html后缀,则默认增加

		if (_staticFileName.indexOf('.html') == -1) {
			_staticFileName = _staticFileName + '.html'
		}

		/**
		 * 渲染和压缩Html
		 * 服务器压缩会消耗一定的性能,产生大概50ms的响应延时
		 * 压缩规则可以在 minifyConf 配置
		 */
		var minifyHtml;

		//注意,务必设置writeResp为false,来调用ejs render string方法
		result.writeResp = false;



		try {
			console.log('渲染前检查');
			console.log(_viewsPathVal);
			var homePageRender = yield that.render(_viewsPathVal, result);
		} catch (err) {
			console.log('render失败了');
			console.log(err);
			that.body = {
				code: 500,
				msg: err.stack
			}
			return false;
		}

		//做一次内容检查
		if (!homePageRender) {
			that.body = {
				code: 500,
				msg: '模板可能渲染出错,或者没有内容'
			}
			return false;
		}

		//render方法默认不需要后缀
		let homeString = homePageRender;
		try {
			// 压缩HTML
			minifyHtml = minify(homeString, minifyConf);
		} catch (err) {
			//若压缩失败,则使用原始HTML,且在尾部增加tag标记,供debug用
			minifyHtml = homeString + '<!-- min -->';
			console.error('HTML压缩失败:' + '\n' + err);
		}
		// console.log(minifyHtml);
		//重新组合文件目录和文件名为一个变量


		var _outputPathAndFileNameVal = _staticFilePathRaw + '/' + _staticFileNameRaw;
		console.log('生成文件');
		console.log(STATIC_OUTPUT_PATH + _staticPathVal);
		let updateIndex = yield fs.writeFile(STATIC_OUTPUT_PATH + _staticPathVal, minifyHtml, 'utf-8');
		//线上环境不生成未压缩版
		if (NODE_ENV !== 'pro') {
			let updateIndexAgain = yield fs.writeFile(STATIC_OUTPUT_PATH + '/' + _outputPathAndFileNameVal + '_orignal.html', homePageRender, 'utf-8');
		}

		that.body = {
			code: 200,
			msg: '更新成功:' + STATIC_OUTPUT_PATH + _staticPathVal
		}
		console.error('成功生成文件:' + STATIC_OUTPUT_PATH + _staticPathVal);
		console.log('*******END***********');
	}
}



/**
 * static_routermap.js 文件,对应的API路由对应指定的post接口
 */

for (var routerVal in staticRouterMap) {
	var _routerVal = routerVal;
	var _staticPathVal = staticRouterMap[routerVal];
	console.error('接口:' + _routerVal + ' --> 对应文件:' + JSON.stringify(_staticPathVal.views));
	router
		.post(_routerVal, configRouter(_routerVal))
}



module.exports = exports = router;