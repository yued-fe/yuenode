'use strict';

/**
 * 模板直出服务
 */

const router = require('koa-router')();
const chalk = require('chalk');
const request = require('co-request');
const url = require('url');
const path = require('path');

const utils = require('../lib/utils.js');
const getConfigs = require('../lib/getConfigs.js');
const routerMap = getConfigs.getRouterMap();
const serverConf = getConfigs.getServerConf();
const siteConf = getConfigs.getSiteConf();
const NODE_ENV = getConfigs.getEnv();

/**
 * 路由处理函数
 * @param routeConf    当前请求在routerMap中的配置
 */
const configRouter = (routeConf) => function* renderRoutersHandler() {
    // 取得去除前缀和端口号的host
    const host = utils.fixHost(this.host);

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
        const {cgiUrl, addr} = yield utils.fixCgi(currentConf.cgi, this.params, this.query);

        // 取得header，根据环境指定后端host,后台根据host来区分后端业务server
        const header = Object.assign({}, this.headers, {host: serverConf.cgi.domain});

        // 发送请求
        const {result, spendTime} = yield utils.requestCgi(cgiUrl, header);

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

        // 如果后台返回200
        if (result.statusCode === 200) {

            body = JSON.parse(result.body);

            // 如果后端返回code不为0，向外抛出
            if (body.code !== 0) {
                // 如果开启taf上报，则上报
                if (!!siteConf.stat) {
                    m_options.returnValue = body.code;
                    monitor.report(m_options, 2, spendTime);
                }

                console.log(chalk.red('后端返回code为：'), body.code);

                try {
                    // 如果开启了非0自定义handler，则执行
                    if (!!siteConf.custom_handle_on) {
                        // 如果配置了自定义handler
                        if (!!siteConf.custom_handle_file) {
                            const errPath = path.join(siteConf.path, siteConf.custom_handle_file);
                            const handler = require(errPath);
                            handler(this, body, cgiUrl);

                        // 兼容以往的handler
                        } else {
                            const errPath = path.join(process.cwd(), 'handler', process.env.NODE_SITE);
                            const handler = require(errPath);
                            handler(this, body, cgiUrl);
                        }
                    }

                    // 在站点配置中开启强制渲染则跳过报错继续渲染
                    if (!siteConf.force_render) {
                        throw new Error('没有开启非0自定义handler');
                    } else {
                        console.log(chalk.blue('开启强制渲染'));
                    }
                    
                // 如果没有配置error handler，则抛出错误统一处理
                } catch (err) {
                    let newErr = new Error(body.msg || '后端 msg 为空');
                    newErr.status = 500;
                    newErr.stack = body.trace || '后端 trace 为空';
                    throw newErr;
                }

            // 如果后端返回code为0
            } else {
                // 如果开启taf上报，则上报
                if (!!siteConf.stat) {
                    m_options.returnValue = body.code;
                    monitor.report(m_options, 1, spendTime);
                }

                // 设置注入逻辑,透传后台的header setcookie
                if (result.headers && result.headers['set-cookie']) {
                    this.set('set-cookie', result.headers['set-cookie']);
                }
            }

        // 如果后台没有返回200，向外抛出
        } else {
            // 如果开启taf上报，则上报
            if (!!siteConf.stat) {
                m_options.returnValue = result.statusCode;
                monitor.report(m_options, 2, spendTime);
            }

            // 如果后端返回301、302，跳转
            if (result.statusCode === 301 || result.statusCode === 302) {
                this.redirect(result.headers.location);
                return 0;
            }

            // 其余状态码直接返回客户端
            let err = new Error('服务返回' + result.statusCode);
            err.status = result.statusCode;
            err.stack = JSON.stringify(result.body,null,4);
            throw err;
        }

    // 没有配置cgi则不向后端发送数据
    } else {
        console.log(chalk.blue('没有配置cgi，不发送后端请求。'));
    }

    // 渲染页面
    let html = this.render(currentConf.views, body);

    // 如果在设置中开启简繁体转换功能，则根据 cookie 中的简繁体设置，转换相应渲染内容
    if (!!siteConf.character_conversion) {
        const Chinese = require('chinese-s2t');
        let isZht = body.Zht === false ? false : this.state.YUE.isZht;
        if (isZht) {
            html = Chinese.s2t(html);
        }
    }

    // 输出html
    this.body = html;
};

for (let route of Object.keys(routerMap)) {
    router.get(route, configRouter(routerMap[route]));
}

module.exports = router;