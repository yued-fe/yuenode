/**
 * middleware
 * 处理favicon路由逻辑
 */

'use strict';

const router = require('koa-router')();
const chalk = require('chalk');
const fs = require('co-fs');

const serverDetective = require('../lib/serverDetective');
const requestHandler = require('../lib/requestHandler');

const NODE_ENV = serverDetective.getEnv();
const SITE_CONF = serverDetective.getSiteConf();
const serverConf = serverDetective.getServerConf();
const routerMap = serverDetective.getRouterMapConf();
const templatePathPrefix = serverConf['views']['path_prefix'] || "";


module.exports = function(path, options) {
    var icon;
    options = options || {};
    var maxAge = options.maxAge == null ? 86400000 : Math.min(Math.max(0, options.maxAge), 31556926000);
    return function* favicon(next) {
        if ('/favicon.ico' != this.path) {
            return yield next;
        }
        console.log("match route:" + this.request.path);
        var that = this;
        //获得默认header头,做透传处理
        var searchQuery = this.request.search; //query透传,不做处理
        var rawHeaders = {};
        Object.assign(rawHeaders, this.req.headers);
        var originHost = rawHeaders['host'];

        //如果配了前缀域名，例如local.或者dev等，域名需要去除这个
        if (templatePathPrefix) {
            var pos = originHost.indexOf(templatePathPrefix);
            if (pos === 0) {
                originHost = originHost.substr(templatePathPrefix.length);
            }
        }

        if ((/\:.*\d/i).test(originHost) == true) {
            originHost = originHost.replace(/\:.*\d/i, '');
        }

        var routerDomain = requestHandler.getRouterDomain(originHost, this.request.path, '');
        var templateFileName = routerDomain['views'];


        if ('GET' !== this.method && 'HEAD' !== this.method) {
            this.status = 'OPTIONS' == this.method ? 200 : 405;
            this.set('Allow', 'GET, HEAD, OPTIONS');
            return;
        }

        if (!icon) {
            icon = yield fs.readFile(serverConf['views']['path'] + '/favicon.ico');
        }

        this.set('Cache-Control', 'public, max-age=' + (maxAge / 1000 | 0));
        this.type = 'image/x-icon';
        this.body = icon;
    };
};