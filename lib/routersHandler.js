/**
 * 读取路由映射,做转换处理
 * Module dependencies.
 * Author:luolei@yuewen.com
 */

'use strict';
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
 * 对配置的路由做兼容处理,统一转成带完整路由 和 完整路径views模式
 * @param  {[type]} originHost [description]
 * @param  {[type]} routerKey  [description]
 * @param  {[type]} val        [description]
 * @return {[type]}            [description]
 */
exports.parseRouterMap = function(routerMap) {
    var routers = {};
    for (var routerVal in routerMap) {

        var _fixRouterConf = {
            views: "",
            cgi: ""
        };

        var _thisRouterView = routerMap[routerVal]['views'];

        //域名不做处理,如果没有cgi,则默认补全
        _fixRouterConf.cgi = !!(routerMap[routerVal]['cgi']) ? routerMap[routerVal]['cgi'] : '';

        var reqPath = "";
        var domain = "_"; //未定义domain
        var pos = routerVal.indexOf("/");

        //如开以 / 开头,则理解成无配置域名
        if (pos === 0) { //path
            reqPath = routerVal;
            _fixRouterConf = routerMap[routerVal];
        } else { //域名

            domain = routerVal.substr(0, pos);
            reqPath = routerVal.substr(pos);
            //如果views没有补全域名,则补全域名
            if (!!_thisRouterView && (_thisRouterView).indexOf('/') === 0 && _thisRouterView.indexOf(domain) === -1) {
                _fixRouterConf.views = domain + _thisRouterView;
            } else {
                _fixRouterConf.views = _thisRouterView;
            }

        }

        if (!routers[reqPath]) {
            routers[reqPath] = {};
        }

        routers[reqPath][domain] = _fixRouterConf;
    }
    return routers;

}