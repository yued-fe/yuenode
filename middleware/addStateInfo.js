'use strict';

/**
 * 将 COOKIE,UA,URL 等信息、自定义扩展、静态文件配置、简繁体信息（如开启）注入 state
 */

const cookies = require('cookie');
const url = require('url');
const dateFormat = require('dateformat');

const getConfigs = require('../lib/getConfigs.js');
const NODE_ENV = getConfigs.getEnv();
const siteConf = getConfigs.getSiteConf();
const serverConf = getConfigs.getServerConf();
const extendsLoader = getConfigs.getExtendsLoader();

module.exports = () => function* addStateInfo(next) {
    // 全局命名空间 YUE
    this.state.YUE = {};
    const userHeader = this.request.header;
    const userCookie = !!userHeader.cookie ? userHeader.cookie : '';
    const cookieObj = cookies.parse(userCookie);

    // 如果在站点设置中开启简繁体转换功能，则通过请求cookie中的 lang 字段判断简繁体
    if (!!siteConf.character_conversion) {
        // 默认为简体中文，以防没有cookie的情况下isZht为undefined
        let isZht = false;
        if (!!userCookie) {
            // 如果有cookie且标记为繁体，则渲染为繁体
            isZht = (cookieObj.lang && cookieObj.lang === 'zht') ? true : false;
        }

        this.state.YUE = Object.assign(this.state.YUE, {
            isZht: isZht
        });
    }
    
    const userUA = !!userHeader['user-agent'] ? userHeader['user-agent'] : 'NO USER-AGENT SET';
    const userClientUrl = this.request.protocol + '://' + this.req.headers.host + this.request.url;
    const userUrlParse = url.parse(userClientUrl, true, true);

    // 将业务中较常使用到的 COOKIE,UA,URL 等信息作为通用信息抛给前端业务方使用
    this.state.YUE = Object.assign(this.state.YUE, {
        ua: userUA,
        location: userUrlParse,
        cookie: cookieObj,

        // 静态文件配置
        pageUpdateTime: dateFormat((new Date()).getTime(), "yyyy-mm-dd,HH:MM:ss"),
        staticConf: (serverConf.static || {}),
        envType: NODE_ENV || ''
    });

    // 如果项目中有自定义扩展，则将扩展方法注入 state
    if (!!extendsLoader) {
        this.state.YUE = Object.assign(this.state.YUE, extendsLoader);
    }

    // 如果在站点设置中开启简繁体转换功能，则通过请求cookie中的 lang 字段判断简繁体
    if (!!siteConf.character_conversion) {
        // 默认为简体中文，以防没有cookie的情况下isZht为undefined
        let isZht = false;
        if (!!userCookie) {
            // 如果有cookie且标记为繁体，则渲染为繁体
            isZht = (cookieObj.lang && cookieObj.lang === 'zht') ? true : false;
        }

        this.state = Object.assign(this.state, {
            isZht: isZht
        });
    }

    // 将业务中较常使用到的 COOKIE,UA,URL 等信息作为通用信息抛给前端业务方使用
    this.state = Object.assign(this.state, {
        CLIENT_URL: userClientUrl,
        cookie: userCookie,
        CLIENT_COOKIE: userCookie,
        CLIENT_UA: JSON.stringify(userUA, null, 4),
        LOCATION: userUrlParse,

        // 静态文件配置
        pageUpdateTime: dateFormat((new Date()).getTime(), "yyyy-mm-dd,HH:MM:ss"),
        staticConf: (serverConf.static || ''),
        envType: NODE_ENV || ''
    });

    // 如果项目中有自定义扩展，则将扩展方法注入 state
    if (!!extendsLoader) {
        this.state = Object.assign(this.state, extendsLoader);
    }

    yield next;
};
