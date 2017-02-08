/**
 * Author:luolei
 * Module dependencies.
 * 处理cookie
 */

'use strict';
const
    koa = require('koa'),
    bodyParser = require('koa-bodyparser'),
    chalk = require('chalk'),
    _ = require('lodash'),
    serverDetective = require('../lib/serverDetective'),
    Q_NODE_ENV = serverDetective.getEnv();


/**
 * 拆离出header头中的cookie
 *
 */
exports.getCookie = function*() {
    let that = this;
    let cookiesOrignal = this.req.rawHeaders;
    let cookies = JSON.parse(JSON.stringify(cookiesOrignal).toLowerCase()),
        cookiesIndex = _.indexOf(cookies, 'cookie');
    let rawCookies = cookiesOrignal[cookiesIndex + 1];
    return rawCookies;
}


