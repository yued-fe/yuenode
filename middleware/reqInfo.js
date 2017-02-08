/**
 * middleware
 * reqInfo 记录信息
 */
'use strict';

const chalk = require('chalk');
const serverDetective = require('../lib/serverDetective');
const NODE_ENV = serverDetective.getEnv();
const SITE_PATH = serverDetective.getSiteConf();
const serverConf = serverDetective.getServerConf();
const staticConf = serverConf['static'];
const templatePathPrefix = serverConf['views']['path_prefix'] || "";

var reqInfo = {};

exports.reqInfo = reqInfo;

exports.reqHandler = function* (next) {
    let headers = this.req.headers;
    reqInfo.headers = headers;
    reqInfo.host = headers['host'];
    reqInfo.search = this.request.search;
    yield next;
}
