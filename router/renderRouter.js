'use strict';

/**
 * 模板直出服务
 */

const router = require('koa-router')();
const chalk = require('chalk');
const request = require('co-request');
const url = require('url');
const path = require('path');
const dateFormat = require('dateformat');

const getConfigs = require('../lib/getConfigs.js');
const routerMap = getConfigs.getRouterMap();
const serverConf = getConfigs.getServerConf();
const siteConf = getConfigs.getSiteConf();
const NODE_ENV = getConfigs.getEnv();

// 去除host前缀，例如local、dev等，去除端口号
function fixHost(host) {
    const reg = new RegExp('^' + NODE_ENV, 'i');
    host = host.replace(reg, '');
    host = host.replace(/:\d*$/, '');
    return host;
}

/**
 * 处理cgi，补全协议、ip，合并query
 * @param   cgi        routerMap中的原始cgi
 * @param   params     类似 /book/:bookId/forum 这种请求url中的变量，从router中取得
 * @param   reqQuery   请求的query，与params共同用于合并出最后的query
 */
function* fixCgi(cgi, params, reqQuery) {

    // 根据环境变量取得协议名，根据配置获得当前环境后端请求地址
    const protocol = !!siteConf.cgi_ssl_on ? 'https:' : 'http:';
    const urlObj = url.parse(cgi, true, true);

    /**
     * 如果在站点配置中开启L5，则通过L5获得后台服务IP或者域名，否则默认使用配置文件中的ip地址
     * 由于L5需要服务器环境支持(依赖底层库),本地调试不载入L5模块防止出错。
     */
    let ip = serverConf.cgi.ip;
    if (!!siteConf.l5_on) {
        // 检查能否启用L5
        if (NODE_ENV !== 'local' && !serverConf.cgi.L5 && !serverConf.cgi.L5.enable) {
            const L5 = require('../lib/co-l5.js');
            const addr = yield L5.getAddr();
            // 如果取得则使用
            if (!!addr) ip = addr;
        }
    }

    let fixedCgi = {
        // 如果cgi有协议则采用，没有则根据环境变量添加
        protocol: (!!urlObj.protocol ? urlObj.protocol : protocol),
        // 如果cgi有域名则采用，没有则根据配置文件添加
        host: (!!urlObj.host ? urlObj.host : ip),
        pathname: urlObj.pathname,
        // 合并query，权重: 请求 query < cgi query < 请求url变量
        query: Object.assign(reqQuery, urlObj.query, params)
    };

    return {
        cgiUrl: url.format(fixedCgi),
        addr: ip
    };
}

/**
 * 请求后端数据
 * @param  url           处理过的url
 * @param  headers       请求header
 * @param  options       请求选项
 */
function* requestCgi(url, headers, options) {
    let opt = {
        'uri': url,
        'method': 'GET',
        'headers': headers,
        'gzip': true, //支持自动解析gzip
        'timeout': 5000,
        'followRedirect': false
    };

    if (options) {
        Object.assign(opt, options);
    }
    let result;
    try {
        console.log(chalk.blue('尝试请求后端:'));
        console.log(opt);
        result = yield request(opt);
        console.log(chalk.blue('后端返回:'));
        console.log(chalk.blue('statusCode: ' + result.statusCode));
        console.log(chalk.blue('header: \n'),result.headers);
    } catch (err) {
        if (err.code === 'ETIMEDOUT') {
            throw new Error('请求超时');
        } else {
            throw new Error('后端通信失败: ' + err.code);
        }
    }
    return result;
}

/**
 * 路由处理函数
 * @param routeConf    当前请求在routerMap中的配置
 */
const configRouter = (routeConf) => function* renderRoutersHandler() {
    // 取得去除前缀和端口号的host
    const host = fixHost(this.host);

    // 取得当前请求的views和cgi配置
    let currentConf;

    // 如果路由映射中有当前域名，按照当前请求域名匹配
    if (!!routeConf[host]) {
        currentConf = routeConf[host];

    // 否则匹配默认配置'_'
    } else {
        currentConf = routeConf._;
    }

    console.log(chalk.blue('匹配到当前路由配置：\n'), currentConf);

    let body = {};

    // 如果配置中有cgi，则向后端请求数据，taf上报
    if (!!currentConf.cgi) {

        // 取得处理过的cgi请求路径，合并query
        const {cgiUrl, addr} = yield fixCgi(currentConf.cgi, this.params, this.query);

        // 取得header，根据环境指定后端host,后台根据host来区分后端业务server
        const header = Object.assign({}, this.headers, {host: serverConf.cgi.domain});

        // 发送请求
        const startTime = Date.now();
        const result = yield requestCgi(cgiUrl, header);
        const spendTime = (Date.now() - startTime) / 1000;

        // 如果站点配置中开启了taf上报，则执行
        let monitor, m_options;
        if (!!siteConf.stat) {
            const Monitor = require('../lib/monitor');
            monitor = new Monitor();

            const ip_port = addr.split(':'); 
            m_options = {
                slaveIp: ip_port[0],
                slaveName: process.env.NODE_SITE || NODE_ENV,
                slavePort: ip_port[1] || 80,
                interfaceName: currentConf.cgi,
            };
        }

        // 后台返回200
        if (result.statusCode === 200) {

            body = JSON.parse(result.body);

            // 如果后端返回code不为0，向外抛出
            if (body.code !== 0) {
                // 如果开启taf上报，则上报
                if (!!siteConf.stat) {
                    m_options.returnValue = body.code;
                    monitor.report(m_options, 2, spendTime);
                }

                try {
                    // 如果开启了非0自定义handler，则执行
                    if (!!siteConf.custom_handle_on) {
                        console.log(chalk.red('statusCode != 0 do handler'));
                        // 如果配置了自定义handler
                        if (!!siteConf.custom_handle_file) {
                            const errPath = path.join(siteConf.path, siteConf.custom_handle_file);
                            const handler = require(errPath);
                            yield handler(this, body, cgiUrl);

                        // 兼容以往的handler
                        } else {
                            const errPath = path.join(process.cwd(), 'handler', process.env.NODE_SITE);
                            const handler = require(errPath);
                            yield handler(this, body, cgiUrl);
                        }
                    }

                    // 在站点配置中开启强制渲染则跳过报错继续渲染
                    if (!siteConf.force_render) {
                        throw new Error('没有开启非0自定义handler');
                    }
                    
                // 如果没有配置error handler，则抛出错误统一处理
                } catch (err) {
                    let err = new Error(body.msg || '后台返回数据code不为0');
                    err.status = 500;
                    throw err;
                }

            // 如果后端返回code为0
            } else {
                // 如果开启taf上报，则上报
                if (!!siteConf.stat) {
                    m_options.returnValue = body.code;
                    monitor.report(m_options, 1, spendTime);
                }

                // 设置注入逻辑,注入后台的 set-cookie 字段
                if (result.headers && result.headers['set-cookie']) {
                    this.set('set-cookie', result.headers['set-cookie']);
                }
            }

        // 后台没有返回200，向外抛出
        } else {
            // 如果开启taf上报，则上报
            if (!!siteConf.stat) {
                m_options.returnValue = result.statusCode;
                monitor.report(m_options, 2, spendTime);
            }

            // 如果后端返回301、302，将跳转地址返回客户端
            if (result.statusCode === 301 || result.statusCode === 302) {
                this.redirect(result.headers.location);
                return 0;
            }

            let err = new Error(result.body);
            err.status = result.statusCode;
            throw err;
        }

    // 没有配置cgi则不向后端发送数据
    } else {
        console.log(chalk.blue('没有配置cgi，不发送后端请求。'));
    }

    // 传入 state 里的数据用于渲染
    body = Object.assign({
        // 兼容静态化页面
        pageUpdateTime: 'sync:' + (dateFormat((new Date()).getTime(), "yyyy-mm-dd,HH:MM:ss"))
    }, this.state, body);

    // 渲染页面
    let html = this.render(currentConf.views, body);

    // 如果在设置中开启简繁体转换功能，则根据 cookie 中的简繁体设置，转换相应渲染内容
    if (!!siteConf.character_conversion) {
        const Chinese = require('chinese-s2t');
        let isZht = body.Zht === false ? false : body.isZht;
        if (isZht) {
            html = Chinese.s2t(html);
        }
    }

    // 输出html
    this.body = html;
};

for (let [route, routeConf] of Object.entries(routerMap)) {
    router.get(route, configRouter(routeConf));
}

module.exports = router;