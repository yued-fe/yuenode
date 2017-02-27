'use strict';

/**
 * L5 中间件
 */


var thunk = require('thunkify');
var L5 = require('@tencent/cl5');
var serverDetective = require('../lib/serverDetective');
var NODE_ENV = serverDetective.getEnv();
var SITE_PATH = serverDetective.getSiteConf();
var serverConf = serverDetective.getServerConf();
var L5_CONF = serverConf['cgi']['L5'];

var ApiGetRoute = thunk(L5['ApiGetRoute']);
var ApiRouteResultUpdate = thunk(L5['ApiRouteResultUpdate']);

function* getAddr() {
	try {
		var addr = yield ApiGetRoute({
		    modid: L5_CONF['conf']['MODID'], //唯一MODID
		    cmd: L5_CONF['conf']['CMDID'], //唯一CMDID
		    timeout: 0.2,
		    debug: false
		});
		var addr = addr[0].ip + ':' + addr[0].port;
		console.log("l5 addr:" + addr);
		return addr;
	}
	catch (err) {
		console.error(err);
		console.error("use default server conf ip:" + serverConf['cgi']['ip']);
		return serverConf['cgi']['ip'];
	}
}

exports.getAddr = getAddr;
exports.apiRouteResultUpdate = ApiRouteResultUpdate;

