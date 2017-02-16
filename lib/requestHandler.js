/**
 * 通用的请求处理
 * Module dependencies.
 * Author:luolei@yuewen.com
 */

'use strict';
const router = require('koa-router')();
const _ = require('lodash');
const serverDetective = require('../lib/serverDetective');
const requestHandler = require('../lib/requestHandler');
const NODE_ENV = serverDetective.getEnv();
const SITE_CONF = serverDetective.getSiteConf();
const serverConf = serverDetective.getServerConf();
const routerMap = serverDetective.getRouterMapConf();
const domainMap = serverDetective.getDomainMap(); //获得域名映射表
const staticConf = serverConf['static'];


/**
 * 检查L5是否启用
 * @return {[type]} [description]
 */
exports.checkL5 = function() {
    if (NODE_ENV === 'local' || !serverConf['cgi']['L5'] || !serverConf['cgi']['L5']['enable'] || !process.env.l5_on) {
        return false;
    } else {
        return true;
    }
}

/**
 * 处理301、302等请求，返回0则不继续处理
 * @param  {[type]} response [description]
 * @param  {[type]} router   [description]
 * @return {[type]}          [description]
 */
exports.handleCgiHeader = function(response, router) {
    switch (response.statusCode) {
        case 301:
        case 302:
            console.log("handle header 301 302");
            console.log(response.headers);
            router.redirect(response.headers.location);
            return 0;
    }
}


/**
 * 获取后端请求的路径与模板路径
 * @param  {[type]} originHost [description]
 * @param  {[type]} routerKey  [description]
 * @param  {[type]} val        [description]
 * @return {[type]}            [description]
 */

exports.getRouterDomain = function(originHost, routerKey, val) {
    let routerVal, views, cgi;
    let useDefault = false; //使用默认当前目录

    console.log("getRouterDomain:");
    // 由于本地无nginx环境, header无法正确传递HOST头
    // 为了适配本地开发,反向查询domainMap匹配正确的view路径
    if (NODE_ENV == 'local') {
        var _subDomainName = originHost.split('.')[0];
        var _domainMapMatchKey = _.findKey(domainMap, function(chr) {
            return chr == originHost
        })
        var _regMatch = new RegExp('^' + _subDomainName, 'g')
        originHost = originHost.replace(_regMatch, _domainMapMatchKey);
        console.log('映射源域名为:' + originHost);
    }
    console.log('修正域名' + JSON.stringify(val) );
    //先判断routes中是否有对应域名的配置，如果没有则认为是默认SITE，无域名目录，请求当前模板目录
    if (typeof val[originHost] !== "undefined") {
        routerVal = val[originHost]
    } else {
        //没有找到域名，取默认值_
        routerVal = val['_'];
        useDefault = true;
    }

    if (typeof routerVal == "object" && routerVal) {
        views = routerVal['views'];
        cgi = routerVal['cgi'];
    } else {
        views = routerKey; //使用默认request path
        cgi = routerVal;
    }

    // if (!useDefault) {
    //     views = "/" + originHost + views;
    // }
    let ret = {
        "views": views,
        "cgi": cgi
    };
    console.log('当前模板');
    console.log(ret.views);
    return ret;
}



