/**
 * yuenode-core 配置文件
 */

'use strict';

const dateformat = require('dateformat');
const cookies = require('cookie');
const url = require('url');

// yworkflow 可以传入 getConfigs 所需参数进行启动，不依赖环境变量
const getConfigs = require('../lib/getConfigs.js')();
const routerMap = getConfigs.getDynamicRouterMap();        // 动态路由
const siteConf = getConfigs.getSiteConf();
const serverConf = getConfigs.getServerConf();
const envType = getConfigs.getEnv();

/**
 * stateInfo
 * 动态静态路由都需要的渲染资料
 */
const stateInfo = {
    // 静态文件配置
    staticConf: serverConf.static || {},
    envType: envType || '',
    extends: getConfigs.getExtendsLoader()
};

module.exports = {
    config: {
        NODE_SITE: siteConf.NODE_SITE,
        ENV_TYPE: envType,
        IP: process.env.IP || '0.0.0.0',
        PORT: process.env.PORT
    },
    middlewares: [
        // 请求记录中间件
        {
            name: 'logger',
            options: {}
        },
        // 错误处理中间件
        {
            name: 'errorHandler',
            options: {
                // 渲染错误页要用的数据
                errorInfo: {
                    envType: envType || '',
                    staticConf: serverConf.static || {},
                    defaultSearch: { 'keywords': '' }
                },
                // pro 环境错误显示 query
                errorMsgPassword: siteConf.error_show_pwd || false
            }
        },
        // favicon
        {
            name: 'favicon',
            options: {
                root: serverConf.views.path
            }
        },
        // lb 探测回包, DONT REMOVE
        {
            name: 'monitorBack',
            options: {}
        },
        /**
         * 将模板渲染方法render注入koa，需要渲染时调用 this.render(views, cgiData);
         * 模板文件统一默认配置使用.html结尾
         * 为了提高服务器性能,默认配置开启cache
         * 模板发布后框架机通过后置脚本重启,所以无需考虑内存缓存问题
         */
        {
            name: 'addEjsRender',
            options: {
                root: serverConf.views.path
            }
        },
        // 简繁体转换
        {
            name: 'characterConversion',
            options: {
                conversionOn: siteConf.character_conversion,
            }
        },
        // 兼容旧项目，将 COOKIE,UA,URL 等信息、自定义扩展、静态文件配置注入
        {
            name: 'addOldRenderInfo',
            options: {
                staticConf: serverConf.static || {},
                extendsLoader: getConfigs.getExtendsLoader()
            }
        },
        // 解析post请求body
        {
            name: 'koa-bodyparser',
            options: {
                detectJSON: function(ctx) {
                    return /\.json$/i.test(ctx.path);
                },
                onerror: function(err, ctx) {
                    if (err) {
                        throw new Error('接口:' + ctx.request.url + '请求的JSON格式有误:\n' + err.message);
                    }
                }
            }
        }
    ],
    routers: [
        // 启用模版渲染路由
        {
            name: 'dynamicRouter',
            options: {
                // 动态路由配置
                routerMap: routerMap,
                // 获取请求ip
                getRequestIP: function* (ctx, isL52) {
                    /**
                     * 无l5
                     */
                    return isL52 ? serverConf.cgi.ip2 : serverConf.cgi.ip;
                },
                // 注入请求header
                getHeader: (header, ctx) => {
                    return Object.assign({
                        'x-host': ctx.header['x-host'] ? ctx.header['x-host'] : ctx.host,
                        'x-url': ctx.url,
                    }, header, {
                        host: serverConf.cgi.domain || ctx.host
                    });
                },
                // 注入渲染数据
                getRenderData: (body, ctx) => {
                    const clientHost = ctx.header['x-host'] ? ctx.header['x-host'] : ctx.host;
                    const userClientUrl = ctx.protocol + '://' + clientHost + ctx.url;
                    const userCookie = ctx.header.cookie || '';

                    // 将业务中较常使用到的信息作为通用信息抛给前端业务方使用
                    body.YUE = Object.assign(body.YUE || {}, stateInfo, {
                        ua: ctx.header['user-agent'] || '',
                        location: url.parse(userClientUrl, true, true),
                        cookie: userCookie,
                        cookieObj: cookies.parse(userCookie),
                    });

                    return body;
                },
            }
        },
        // 启用静态化路由
        {
            name: 'staticRouter',
            options: {
                // 静态化服务开关
                staticServerOn: siteConf.static_server_on,
                // 静态文件存放跟路径
                staticFileRoot: serverConf.index,
                // 静态化接口路由路径和路由配置
                staticPath: siteConf.static_server_cgi,
                staticRouterMap: getConfigs.getStaticRouterMap(),
                // 新静态化接口路由路径和路由配置
                dynamicStaticPath: siteConf.static_dynamic_router,
                dynamicRouterMap: routerMap,
                // 获取请求ip
                getRequestIP: function* (ctx) {
                    /**
                     * 无l5
                     */
                    return isL52 ? serverConf.cgi.ip2 : serverConf.cgi.ip;
                },
                // 注入请求header
                getHeader: (header, ctx) => {
                    return Object.assign({
                        'x-host': ctx.header['x-host'] ? ctx.header['x-host'] : ctx.host,
                        'x-url': ctx.url,
                    }, {
                        host: serverConf.cgi.domain || ctx.host
                    });
                },
                // 注入渲染数据
                getRenderData: (body, ctx) => {
                    // 将业务中较常使用到的信息作为通用信息抛给前端业务方使用
                    body.YUE = Object.assign(body.YUE || {}, stateInfo , {
                        pageUpdateTime: dateformat(Date.now(), "yyyy-mm-dd,HH:MM:ss"),
                    });

                    return body;
                },
            }
        }
    ]
};