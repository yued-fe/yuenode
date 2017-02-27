'use strict';

/**
 * Yuenode
 * Author:luolei,yanxiang
 * url:http://git.code.oa.com/yuewen/yuenode
 */



const koa = require('koa');
const path = require('path');
const request = require('co-request');
const logger = require('koa-logger');
const router = require('koa-router')();
const serve = require('koa-static');
const chalk = require('chalk');
const bodyParser = require('koa-bodyparser');
const app = koa();
const dateformat = require('dateformat');
const _ = require('lodash');



/**
 * 框架机业务自定义中间件
 * @type {[type]}
 */
const error = require('./lib/errorHandler');
const serverDetective = require('./lib/serverDetective');
const SITE_CONF = serverDetective.getSiteConf();
const DEBUG = serverDetective.isDebug();
const serverConf = serverDetective.getServerConf();
const templatePath = serverConf['views']['path'];


const reqInfo = require('./middleware/reqInfo');
const render = require('./middleware/koa-qidian-ejs');
const favicon = require('./middleware/favicon');
const qidianExtens = require('./middleware/extends');
const ClientHeader = require('./middleware/client-request-header');
const ChineseChecker = require('./middleware/chinese');

//静态化所需要的其他模块
const fs = require('co-fs');
const filesDetective = require('./lib/filesDetective');

// 文件日志模块
const loggerFile = require('./lib/logger');


//在nginx无设置的情况下,配置默认的favicon规则路由,防止大量favicon的404请求被catch error
app.use(favicon());
//这是一个神奇的中间件,支持自定义拓展方法
app.use(qidianExtens());
//起点域下通用的检查简繁体的插件
app.use(ChineseChecker());
app.use(reqInfo.reqHandler);
app.use(ClientHeader())

// lb探测回包, DONT REMOVE
app.use(function*(next) {
    if (this.request.path === '/monitor/monitor.jsp') {
        this.body = '0';
    } else {
        yield next;
    }
});

/**
 * 解析header body JSON,如果出错
 */
app.use(bodyParser({
    detectJSON: function(ctx) {
        return /\.json$/i.test(ctx.path);
    },
    onerror: function(err, ctx) {
        if (err) {
            throw new Error('\n接口:' + ctx.request.url + '\n请求的JSON格式有误:\n错误日志如下:\n' + err.stack)
        }
    }
}));

/**
 * 错误处理中间间，必须开启
 */
app.use(error(reqInfo.reqInfo));
if (DEBUG) {
    app.use(logger());
    app.use(serve(__dirname + '/static'));
}

/**
 * 默认开启调试日志
 */
app.use(function*(next) {
    console.log(chalk.blue('----'));
    console.log(this.request.headers);
    console.log(chalk.blue('----'));
    yield next;
});


/**
 * 载入业务路由逻辑
 * @type {[type]}
 */

let commonRouter = require('./router/common.js'); //通配路由

/**
 * 模板文件统一使用.html结尾
 * 为了提高服务器性能,开启cache
 * 模板发布后框架机通过后置脚本重启,所以无需考虑内存缓存问题
 */

render(app, {
    root: templatePath,
    layout: false,
    viewExt: 'html',
    cache: true,
    debug: true
});


/**
 * '/' 通用业务路由
 */
router.use('', commonRouter.routes());


/**
 * 静态化服务
 * 静态化路由约束为 /api/v2/setData 开头
 * @param  {[type]} process.env.static_server_on [description]
 * @return {[type]}                              [description]
 */
if (process.env.static_server_on == 'true') {
    let staticRouter = require('./router/static.js');
    router.use('/api/v2/setData', staticRouter.routes());
    const checkStaticPath = require('./lib/checkStaticPath.js');
    // 文件检查机制
    checkStaticPath.init()
}

app.use(router.routes());
app.use(router.allowedMethods());


/**
 * 启动服务
 */
app.host = SITE_CONF['host'];
app.port = SITE_CONF['port'];

/**
 * 具体的服务端口可以在config 目录中设置
 */
let server = app.listen(app.port, app.host, function() {
    console.log(chalk.green('Reboot at: ') + chalk.red(dateformat((new Date()).getTime(), 'yyyy.mm.dd / hh:MM:ss TT')));
    console.log(chalk.green('Yuenode Server listening on %s:%d'), server.address().address, server.address().port);
    console.log(chalk.green('Process.env on: ') + chalk.blue(serverDetective.getEnv()));
    console.log(chalk.green('Server IP: ') + serverDetective.getIP());
    console.log(chalk.green('You can visit:'));
});