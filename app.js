'use strict';

global.Promise = require('bluebird');
const app = require('koa')();
const chalk = require('chalk');
const router = require('koa-router')();
const dateformat = require('dateformat');

const logger = require('./middleware/logger.js');
const onerror = require('./middleware/errorHandler.js');
const favicon = require('./middleware/favicon.js');
const addStateInfo = require('./middleware/addStateInfo.js');
const ejsRender = require('./middleware/addEjsRender.js');
const getConfigs = require('./lib/getConfigs.js');
const siteConf = getConfigs.getSiteConf();
const serverConf = getConfigs.getServerConf();
const renderRouter = require('./router/renderRouter.js');

// 请求记录中间件
app.use(logger());

// 错误处理中间件
onerror(app);

// favicon
app.use(favicon());

// lb探测回包, DONT REMOVE
app.use(function* (next) {
    if (this.request.path === '/monitor/monitor.jsp') {
        this.body = '0';
    } else {
        yield next;
    }
});

// 将 COOKIE,UA,URL 等信息、自定义扩展、静态文件配置、简繁体信息（如开启）注入 state
app.use(addStateInfo());

/**
 * 将模板渲染方法render注入koa，需要渲染时调用 this.render(views, cgiData);
 * 模板文件统一默认配置使用.html结尾
 * 为了提高服务器性能,默认配置开启cache
 * 模板发布后框架机通过后置脚本重启,所以无需考虑内存缓存问题
 */
ejsRender(app, {
    root: serverConf.views.path
});

// 启用模版渲染路由
router.use('', renderRouter.routes());

/**
 * 如果在站点配置中开启静态化服务，则启用静态化路由
 * 静态化服务向后端暴露的接口路径为 /api/v2/setData/:route
 */
if (!!siteConf.static_server_on) {
    const bodyParser = require('koa-bodyparser');

    // 解析post请求body
    app.use(bodyParser({
        detectJSON: function(ctx) {
            return /\.json$/i.test(ctx.path);
        },
        onerror: function(err, ctx) {
            if (err) {
                throw new Error('接口:' + ctx.request.url + '请求的JSON格式有误:\n' + err.stack);
            }
        }
    }));

    // 启用原有静态化路由
    if (!!siteConf.static_server_cgi) {
        const {staticRouter} = require('./router/staticRouter.js');
        router.use(siteConf.static_server_cgi, staticRouter.routes());
    }

    // 启用静态化复用动态化路由
    if (!!siteConf.static_dynamic_router) {
        const {staticDynamicRouter} = require('./router/staticRouter.js');
        router.use(siteConf.static_dynamic_router, staticDynamicRouter.routes());
    }
}

// 启用路由
app.use(router.routes());
app.use(router.allowedMethods());

// 开启服务监听
const env = process.env;
const IP = getConfigs.getIP();

app.listen(env.port, () => {

    console.log(
        chalk.green('\n = = = = = = = = = = = = = = = = = = = = = =\n'),
        chalk.green('Reboot at: '), chalk.red(dateformat((new Date()).getTime(), 'yyyy-mm-dd HH:MM:ss')), '\n',
        chalk.green('Server NODE_SITE: '), chalk.blue(env.NODE_SITE), '\n',
        chalk.green('Server NODE_ENV: '), chalk.blue(env.NODE_ENV), '\n',
        chalk.green('Server IP: '), chalk.bold(IP), '\n',
        chalk.green('Yuenode Server is listening on port: '), chalk.bold(env.port), '\n',
        chalk.green('= = = = = = = = = = = = = = = = = = = = = =\n')
    );
});


module.exports = app;

