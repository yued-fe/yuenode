'use strict';

/**
 * 通配路由
 */

const router = require('koa-router')();
const views = require('co-views');
const chalk = require('chalk');
const request = require('co-request');
const parse = require('co-body');
const dateFormat = require('dateformat');
const _ = require('lodash');
const cookies = require('cookie');


const serverDetective = require('../lib/serverDetective');
const requestHandler = require('../lib/requestHandler');
const routersHandler = require('../lib/routersHandler');
const NODE_ENV = serverDetective.getEnv();
const SITE_CONF = serverDetective.getSiteConf();
const serverConf = serverDetective.getServerConf();
const routerMap = serverDetective.getRouterMapConf();
const domainMap = serverDetective.getDomainMap(); //获得域名映射表
const templatePathPrefix = serverConf['views']['path_prefix'] || "local";
const staticConf = serverConf['static'];
const Monitor = require("../lib/monitor");


/**
 * 由于L5需要服务器环境支持(依赖底层库),本地调试不载入L5模块防止出错。
 */

var L5;
if (NODE_ENV !== 'local') {
    L5 = require('../lib/co-l5');
}

/**
 * 处理后端请求
 * @param {[type]} url           [description]
 * @param {[type]} headers       [description]
 * @param {[type]} options       [description]
 * @yield {[type]} [description]
 */

var cgiRequest = function*(url, headers, options) {
    let _options = {
        'uri': url,
        'method': 'GET',
        'headers': headers,
        'gzip': true, //支持自动解析gzip
        //'json': {}, //todo : tsf有问题，手动解析json
        'timeout': 5000,
        'followRedirect': false
    };

    if (options) {
        Object.assign(_options, options);
    }

    let result;
    try {
        console.log("尝试请求后端:");
        console.log(_options);
        result = yield request(_options);
        console.log("后端返回:");
        console.log(chalk.blue("header:"));
        console.log(chalk.blue("statusCode:" + result.statusCode));
    } catch (err) {
        if (err.code === 'ETIMEDOUT') {
            throw new Error('请求超时')
        } else {
            throw new Error('后端通信失败' + err.code)
        }
    }
    return result;
}

/**
 * 分析config配置,载入路由和相关模板逻辑
 * @param  {[type]} val [description]
 * @return {[type]}     [description]
 */
var configRouter = function(val) {
    return function* customeRoutersHandler(next) {

        console.log("match route:" + this.request.path);
        var that = this;
        var searchQuery = this.request.search; //query透传,不做处理
        var rawHeaders = {}; //获得默认header头,透传

        Object.assign(rawHeaders, this.req.headers);
        var originHost = rawHeaders['host'];

        /**
         * host中默认不允许使用端口
         * 过滤掉:后面的端口
         * @type {[type]}
         */

        //过滤掉端口port
        originHost = originHost.replace(/\:\d.*/g, '')

        //如果配了前缀域名，例如local.或者dev等，域名需要去除这个
        if (templatePathPrefix) {
            var pos = originHost.indexOf(templatePathPrefix);
            if (pos === 0) {
                originHost = originHost.substr(templatePathPrefix.length);
            }
        }
        //获得路由信息
        var routerDomain = requestHandler.getRouterDomain(originHost, this.request.path, val);
        var templateFileName = routerDomain['views'];
        var cgi = routerDomain['cgi'];
        var _pageRequestUrl;
        let body;

        try {
            body = {};
            if (cgi) {
                // 如果指定了cgi,则依次执行L5 上报 渲染逻辑

                // 若cgi配置中配置了自定义query参数,则拆分出来做单独处理
                // 注:cgi中的参数为业务强约束,优先级最高
                var addr,_cgiRaw, _cgiToAppendQuery;

                if (!!cgi.split('?')) {
                    _cgiRaw = cgi.split('?')[0]; //获得cgi原始路由
                    _cgiToAppendQuery = !!(cgi.split('?')[1]) ? (cgi.split('?')[1]) : '';
                }

                if (requestHandler.checkL5()) {
                    addr = yield L5.getAddr();
                } else {
                    //如果L5没有开启,则默认使用配置文件中的ip地址
                    addr = serverConf['cgi']['ip'];
                }

                // 重构query值
                var _newQuerys = '';

                if(!!searchQuery){
                    if(!!_cgiToAppendQuery){
                          _cgiToAppendQuery = '&' + _cgiToAppendQuery;
                    }
                }else{
                    _cgiToAppendQuery = '?' + _cgiToAppendQuery;
                }


                //由于是内网通讯,默认走http协议头
                //如果Cgi中有配置query值,默认都append到client端query值后面
                _pageRequestUrl = 'http://' + addr + _cgiRaw + searchQuery + _cgiToAppendQuery;
                console.log('[Qidian]当前请求后台接口:' + _pageRequestUrl);
                if (serverConf['cgi']['domain']) {
                    rawHeaders.host = serverConf['cgi']['domain']; //指定Host到后端
                }

                //上报跟后端服务的数据
                var begin = Date.now();
                var response = yield cgiRequest(_pageRequestUrl, rawHeaders);
                var timeout = (Date.now() - begin) / 1000;
                var ip_port = addr.split(":");

                var m_options = {
                    "slaveIp": ip_port[0],
                    "slaveName": process.env.NODE_SITE || "local",
                    "slavePort": ip_port[1] || 80,
                    "interfaceName": _cgiRaw,
                };
                var monitor = new Monitor();
                var succ = 1;

                //处理返回头
                var ret = requestHandler.handleCgiHeader(response, that);

                if (ret === 0) {
                    m_options['returnValue'] = response.statusCode;
                    monitor.report(m_options, succ, timeout);
                    return yield next;
                }
                console.log(response.headers);
                //设置注入逻辑,注入后台的 set-cookie 字段
                if(!!response.headers['set-cookie']){
                    that.set('set-cookie',response.headers['set-cookie'])
                }
                body = !!response.body ? response.body : {};
                console.log('[LOG CGI]后台返回数据:');
                // console.log(body);
                body = eval("(" + body + ")");

                body.envType = NODE_ENV || '';
                body.staticConf = staticConf || '';
                var _statusCode = parseInt(body.code);

                if (_statusCode !== 0) {
                    succ = 2;
                }
                m_options['returnValue'] = _statusCode;
                monitor.report(m_options, succ, timeout);
                if (_statusCode === 0) {
                    console.log('对应模板是' + serverConf['views']['path'] + templateFileName);
                    yield that.render(templateFileName, body);
                } else {
                    //针对其他
                    try {
                        console.log("statusCode != 0 do handler");
                        var handler = require("../handler/" + process.env.NODE_SITE);
                        yield handler(that, body, _pageRequestUrl);
                    } catch (err) {
                        console.error(err);
                        body.error = '后台接口:' + _pageRequestUrl + ' 返回数据:' + JSON.stringify(body);
                        that.status = 500;
                        yield that.render('error', body);
                    }
                }
            } else {
                console.log('无需请求后端');
                console.log('对应模板是' + serverConf['views']['path'] + templateFileName);
                body.envType = NODE_ENV || '';
                body.staticConf = staticConf;
                body.defaultSearch = {};
                yield that.render(templateFileName, body);
            }
        } catch (err) {
            throw new Error('全局捕获异常\n后端请求接口为:' + _pageRequestUrl + "\nbody：" + JSON.stringify(body, null, 2) + "\n异常信息:" + err);
        }
    };
}


/**
 * 路由兼容加载
 * 对配置的路由做兼容处理,统一转成带host路由 和 完整路径views模式
 */
console.log('处理路由');
console.log(routerMap);
var routes = routersHandler.parseRouterMap(routerMap);

/**
 * 遍历routermap.js 文件,所有的路由均有指定cgi接口匹配
 */

for (var routerVal in routes) {
    // console.log('加载koa路由 ' + routerVal + ' : ' +  JSON.stringify(routes[routerVal]) );
    router.get(routerVal, configRouter(routes[routerVal]));
}

module.exports = router;