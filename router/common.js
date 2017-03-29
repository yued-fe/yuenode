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
const qs = require('qs');

const serverDetective = require('../lib/serverDetective');
const requestHandler = require('../lib/requestHandler');
const routersHandler = require('../lib/routersHandler');
const NODE_ENV = serverDetective.getEnv();
const serverConf = serverDetective.getServerConf();
const routerMap = serverDetective.getRouterMapConf();
const customHandler = serverDetective.getCustomHandler();

const templatePathPrefix = serverConf['views']['path_prefix'] || NODE_ENV;
const staticConf = serverConf['static'];
const Monitor = require('../lib/monitor');



/**
 * 由于L5需要服务器环境支持(依赖底层库),本地调试不载入L5模块防止出错。
 */

var L5;
if (process.env.l5_on == true) {
    L5 = require('../lib/co-l5');
}

/**
 * 检查query字符串是否有问号开头
 * @param  {[type]} queryString [description]
 * @return {[type]}             [description]
 */
function queryStartMarkChecker(queryString){
    return  queryString = (queryString && queryString.indexOf('?') === -1 ) ? '?' + queryString : queryString ;
}

/**
 * 根据路由配置,重构proxy中的参数
 * 可以将路由中的通配符号转成 query 值
 * 'm.qidian.com/book/:bookId/:someId/forum': { views: 'm.qidian.com/book/forum', cgi: '/mpage/forum/getBookForum' },
 * 后台CGI转成 http://{CGI-SERVER}/mpage/forum/getBookForum?bookId={具体参数}&someId={具体参数}&others=...
 */
function getProxyQuery(searchQuery, rawRoute, that) {

    // 如果请求的实际路由与配置路由不相同,则对参数做rewrite处理
    if (rawRoute !== that.request.path) {
        let queryObj = {};
        let rawSplit = rawRoute.split('/');
        let realSplit = that.request.path.split('/');

        let i = 0;
        let routeSplitLength = rawSplit.length;

        for (i; i < routeSplitLength; i++) {
            if (rawSplit[i] !== realSplit[i]) {
                // 移除掉路由开头的分号
                let customeRouteKey = rawSplit[i].substring(1);
                queryObj[customeRouteKey] = realSplit[i];
            }
        }
        let proxyQueryResult = Object.assign(qs.parse(searchQuery.replace(/^\?/,'')), queryObj);
        searchQuery = qs.stringify(proxyQueryResult, {
            encodeValuesOnly:true
        })
    }

    // 如果query值存在且开头无问号,则自动补全
    searchQuery = queryStartMarkChecker(searchQuery);
    return searchQuery;
}


/**
 * 获得后台Cgi的真实URL
 * @param  {[type]} cgi         [description]
 * @param  {[type]} searchQuery [description]
 * @param  {[type]} searchQuery [初始上报时间]
 * @return {[type]}             [description]
 */
function* getCgi(cgi, searchQuery, monitStartTime) {

    let result = {};
    //query透传,不做处理,只在请求后台cgi时才有实际用途
    let addr; // 后台cgi server地址
    let cgiRaw = cgi; // 原始cgi接口路由
    let cgiToAppendQuery; // 增加的query参数

    // 获得cgi中配置的参数:为最高权限
    let customQuery = qs.parse(cgi.split('?')[1]);
    if (!!cgi.split('?') && cgi.split('?').length > 1) {
        cgiRaw = cgi.split('?')[0]; //如果有自定义参数,则取原始cgi路由
        cgiToAppendQuery = !!(cgi.split('?')[1]) ? (cgi.split('?')[1]) : '';
    }

    // 来获得后台服务IP或者域名
    if (requestHandler.checkL5()) {
        addr = yield L5.getAddr();
    } else {
        //如果L5没有开启,则默认使用配置文件中的ip地址
        addr = serverConf['cgi']['ip'];
    }

    // 合并query
    let queryMerged = Object.assign(qs.parse(searchQuery),customQuery)
    let queryMergedString = qs.stringify(queryMerged, {
            encode: false // 方便调试,关闭encode
        });
    queryMergedString = queryStartMarkChecker(queryMergedString);
    // 根据配置文件,开启是否启动https
    let cgiProtocal = (process.env.cgi_ssl_on == 'true') ? 'https' : 'http';

    result = {
        url: cgiProtocal + '://' + addr + cgiRaw + queryMergedString,
        addr: addr,
        cgiRaw: cgi
    }

    return result;
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
 * @param  {[type]} val      [description]
 * @param  {[type]} rawRoute [映射的原始路由]
 * @return {[type]}          [description]
 */
var configRouter = function(val, rawRoute) {
    return function* customeRoutersHandler(next) {
        let that = this;

        // 分析路由路径
        console.log(chalk.red('配置路由:' + rawRoute));
        console.log(chalk.red('请求路由:' + that.request.path));

        //获得默认header头,透传
        let rawHeaders = {};
        Object.assign(rawHeaders, that.req.headers);

        // 获得proxy转换处理后的请求参数
        let searchQuery = getProxyQuery(that.request.search, rawRoute, that);

        // 获得用户的原始host头信息
        // 过滤掉端口port,以便映射到相应路径
        let originHost = rawHeaders['host'].replace(/\:\d.*/g, '');

        //如果配了前缀域名，例如local.或者dev等，域名需要去除这个
        if (templatePathPrefix) {
            var pos = originHost.indexOf(templatePathPrefix);
            if (pos === 0) {
                originHost = originHost.substr(templatePathPrefix.length);
            }
        }

        //获得该路由对应的 cgi 信息
        let routerDomain = requestHandler.getRouterDomain(originHost, that.request.path, val);
        let templateFileName = routerDomain['views'];


        let cgi = routerDomain['cgi'];
        let pageRequestUrl;
        let body;

        try {
            body = {};
            if (cgi) {
                // 如果指定了cgi,则依次执行L5 上报 渲染逻辑
                // 若cgi配置中配置了自定义query参数,则拆分出来做单独处理
                // 注:cgi中的参数优先级最高
                let requestCgiUrl = yield getCgi(cgi, searchQuery)

                //由于是内网通讯,默认走http协议头
                //如果 cgi 中有配置 query 值,默认都append到client端query值后面
                pageRequestUrl = requestCgiUrl.url;
                console.log('[Qidian]当前请求后台接口:' + pageRequestUrl);
                // 后台根据host来区分后端业务server
                if (serverConf['cgi']['domain']) {
                    rawHeaders.host = serverConf['cgi']['domain']; //指定Host到后端
                }

                //上报跟后端服务的数据
                var begin = Date.now();
                var response = yield cgiRequest(pageRequestUrl, rawHeaders);

                var timeout = (Date.now() - begin) / 1000;
                var ip_port = requestCgiUrl.addr.split(":");
                var m_options = {
                    "slaveIp": ip_port[0],
                    "slaveName": process.env.NODE_SITE || NODE_ENV,
                    "slavePort": ip_port[1] || 80,
                    "interfaceName": requestCgiUrl.cgi,
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

                //设置注入逻辑,注入后台的 set-cookie 字段
                if (!!response.headers['set-cookie']) {
                    that.set('set-cookie', response.headers['set-cookie'])
                }

                body = !!response.body ? JSON.parse(response.body) : {};
                console.log('[LOG CGI]后台返回数据:');
                body.envType = NODE_ENV || '';
                body.staticConf = staticConf || '';
                var statusCode = parseInt(body.code);

                if (statusCode !== 0) {
                    succ = 2;
                }
                m_options['returnValue'] = statusCode;
                monitor.report(m_options, succ, timeout);

                if (statusCode === 0) {
                    console.log('对应模板是' + serverConf['views']['path'] + templateFileName);
                    yield that.render(templateFileName, body);
                } else {
                    //针对其他
                    try {
                        console.log("statusCode != 0 do handler");
                        yield customHandler(that, body, pageRequestUrl);
                    } catch (err) {
                        console.error(err);
                        body.error = '后台接口:' + pageRequestUrl + ' 返回数据:' + JSON.stringify(body);
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
            throw new Error('全局捕获异常\n后端请求接口为:' + pageRequestUrl + "\nbody：" + JSON.stringify(body, null, 2) + "\n异常信息:" + err);
        }
    };
}

/**
 * 路由兼容加载
 * 对配置的路由做兼容处理,统一转成带host路由 和 完整路径views模式
 */
let routes = routersHandler.parseRouterMap(routerMap);

/**
 * 遍历routermap.js 文件,所有的路由均有指定cgi接口匹配
 */
for (var routerVal in routes) {
    router.get(routerVal, configRouter(routes[routerVal], routerVal));
}

module.exports = router;