'use strict';

/**
 * 静态化服务
 */

const chalk = require('chalk');
const dateFormat = require('dateformat');
const fs = require('fs');
const path = require('path');

const utils = require('../lib/utils.js');
const getConfigs = require('../lib/getConfigs.js');
const serverConf = getConfigs.getServerConf();
const siteConf = getConfigs.getSiteConf();

// 检查文件夹是否存在,若不存在则创建
function checkDirectory(dirPath) {
    try {
        fs.statSync(dirPath);
    } catch (err) {
        fs.mkdirSync(dirPath);
        console.log(chalk.cyan('静态化目录不存在，创建此文件目录:\n'), dirPath);
        try {
            fs.statSync(dirPath);
        } catch (err) {
            console.log(chalk.red('创建静态化目录 %s 失败！请确认有写入权限。'), dirPath);
            throw new Error(`创建静态化目录失败`);
        }
    }
}

// 启动时先检查一下静态资源文件根目录是否存在,返回格式好的根目录
function checkStaticRootPath(staticRoot) {
    // 读取静态文件根目录配置
    let staticPath;
    if (typeof staticRoot === 'string') {
        staticPath = staticRoot.split('/').filter(n => n !== '');
    } else {
        // 兼容老写法
        staticPath = staticRoot.path.split('/').filter(n => n !== '');
    }
    let pathArr = ['', ...staticPath];

    // 保存静态文件根目录
    staticRoot = pathArr.join('/');

    // 检查是否存在，不存在则创建
    pathArr.reduce((pre, next) => {
        let curPath = pre + '/' + next;
        checkDirectory(curPath);
        return curPath;
    });
    return staticRoot;
}

// 静态文件根目录
let staticRoot = checkStaticRootPath(serverConf.index);

/**
 * 生成静态页面
 * @param  {[type]} ctx       this
 * @param  {[type]} routeConf 路由配置
 * @param  {[type]} viewPath  生成静态文件路径
 * @param  {[type]} data      数据
 */
function writeStaticFile(ctx, routeConf, viewPath, data) {
    let html;
    try {
        html = ctx.render(routeConf.views, data);
    } catch (err) {
        ctx.body = {
            code: 500,
            msg: err.message
        };
        ctx.status = 500;
        return false;
    }

    //做一次内容检查
    if (!html) {
        ctx.body = {
            code: 500,
            msg: '模板可能渲染出错,或者没有内容'
        };
        ctx.status = 500;
        return false;
    }

    // 压缩 html
    html = utils.compressHTML(html);

    // 生成静态文件
    try {
        fs.writeFileSync(viewPath, html, 'utf8');
        console.log(chalk.green('生成静态文件 %s 成功。'), viewPath);
        ctx.body = {
            code: 0,
            msg: `生成静态文件 ${viewPath} 成功。`
        };
    } catch (err) {
        console.log(chalk.red('生成静态文件 %s 失败，请检查是否有写入权限。'), viewPath);
        ctx.body = {
            code: 500,
            msg: `生成静态文件 ${viewPath} 失败，请检查是否有写入权限。`
        };
        ctx.status = 500;
        return false;
    }
}

/**
 * 配置路由
 * @param  routerMap 
 * @param  router    router 实例
 * @param  configFn  配置函数
 */
function setRouter(routerMap, router, configFn) {
    for (let route of Object.keys(routerMap)) {
        const routeConf = routerMap[route];
        // 如果动态路由配置了静态化，则启用静态化
        if (!!routeConf.static) {
            // 检查每个路由配置的文件夹是否存在
            const staticPath = routeConf.static.split('/').filter(n => n !== '');
            let pathArr = [staticRoot, ...staticPath];
            // 如果以路径以 .html 结尾，就将其作为静态生成文件的文件名，否则将路径全部视为文件夹，文件名默认用 index.html
            let fileName = 'index.html';
            if (pathArr[pathArr.length-1].endsWith('.html')) {
                fileName = pathArr.splice(-1)[0];
            }

            // 检查静态文件生成目录是否存在，不存在则创建
            let filePath;
            pathArr.reduce((pre, next) => {
                filePath = pre + '/' + next;
                checkDirectory(filePath);
                return filePath;
            });
            
            // 路由path不以'/'开头的则补全
            route = route.startsWith('/') ? route : '/' + route;
            const viewPath = path.join(filePath, fileName);
            router.post(route, configFn(routeConf, viewPath));
        }
    }
}

// 原有静态化服务
if (!!siteConf.static_server_cgi) {
    const staticRouter = require('koa-router')();
    const staticRouterMap = getConfigs.getStaticRouterMap();

    /**
     * 静态化处理函数
     * @param  {object} routeConf 路由配置
     * @param  {string} viewPath  要生成的文件路径
     */
    const configRouter = (routeConf, viewPath) => function staticRoutersHandler() {
        console.log(chalk.blue('匹配到当前静态路由配置：\n'), routeConf);

        // 生成静态页面
        writeStaticFile(this, routeConf, viewPath, this.request.body);
    };

    // 设置路由
    setRouter(staticRouterMap, staticRouter, configRouter);

    // 导出原有静态化路由
    exports.staticRouter = staticRouter;
}

// 新静态化接口，复用动态路由
if (!!siteConf.static_dynamic_router) {
    const staticDynamicRouter = require('koa-router')();
    let dynamicRouterMap = getConfigs.getOriginRouterMap();

    /**
     * 静态化处理函数
     * @param  {object} routeConf 路由配置
     * @param  {string} viewPath  要生成的文件路径
     */
    const configRouter = (routeConf, viewPath) => function* staticRoutersHandler() {
        console.log(chalk.blue('匹配到当前静态路由配置：\n'), routeConf);

        // 取得去除前缀和端口号的host
        const host = utils.fixHost(this.host);

        let body = {};

        // 如果配置中有cgi，则向后端请求数据
        if (!!routeConf.cgi) {

            // 取得处理过的cgi请求路径，合并query
            const {cgiUrl, addr} = yield utils.fixCgi(routeConf.cgi, this.params, this.query);

            // 取得header，根据环境指定后端host,后台根据host来区分后端业务server
            const header = Object.assign({}, this.headers, {host: serverConf.cgi.domain});

            // 发送请求
            const {result} = yield utils.requestCgi(cgiUrl, header);

            // 如果后台返回200
            if (result.statusCode === 200) {

                body = JSON.parse(result.body);

                // 如果后端返回code不为0
                if (body.code !== 0) {
                    this.body = {
                        code: 500,
                        msg: `请求后端返回数据code不为0, ${body.msg}`
                    };
                    this.status = 500;
                    return false;
                } 

            // 如果后台没有返回200
            } else {
                this.body = {
                    code: result.statusCode,
                    msg: `请求后端返回状态码 ${result.statusCode}, ${result.body}`
                };
                this.status = 500;
                return false;
            }

        // 没有配置cgi则不向后端发送数据
        } else {
            console.log(chalk.blue('没有配置cgi，不发送后端请求。'));
        }

        // 生成静态页面
        writeStaticFile(this, routeConf, viewPath, body);
    };

    // 设置路由
    setRouter(dynamicRouterMap, staticDynamicRouter, configRouter);

    // 导出复用动态路由的静态化路由
    exports.staticDynamicRouter = staticDynamicRouter;
}

