/**
 * 处理自定义拓展的中间件
 * Author:罗磊
 * Des:通过在views模板src/node-config/extens路径自定义模块,提供koa拓展方法
 */

'use strict';

const serverDetective = require('../lib/serverDetective');
const extendsLoaderPath = serverDetective.getExtendsLoader();
const renderExtends = require(extendsLoaderPath);

console.log(renderExtends);

var KoaExtends = function(){
	var renderExtendsFunc;
	renderExtendsFunc = !!renderExtends ? renderExtends : {};
    return function* extendsLoader(next) {
    	this.state =Object.assign(this.state,renderExtendsFunc)
    	yield next;
    }
}

module.exports = KoaExtends;

