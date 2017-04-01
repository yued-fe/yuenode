'use strict';

/**
 * 静态化服务
 */

const router = require('koa-router')();
const chalk = require('chalk');
const dateFormat = require('dateformat');
const fs = require('fs');
const path = require('path');

const utils = require('../lib/utils.js');
const getConfigs = require('../lib/getConfigs.js');
const staticRouterMap = getConfigs.getStaticRouterMap();
const serverConf = getConfigs.getServerConf();
const siteConf = getConfigs.getSiteConf();

// 静态文件根目录
let staticRoot = utils.checkStaticRootPath(serverConf.index);

/**
 * 静态化处理函数
 * @param  {object} routeConf 路由配置
 * @param  {string} filePath  要生成的文件路径
 * @param  {string} fileName  要生成的文件名
 */
const configRouter = (routeConf, filePath, fileName) => function staticRoutersHandler() {
    console.log(chalk.blue('匹配到当前静态路由配置：\n'), routeConf);

    // 传入请求数据、state数据用于渲染
    let body = Object.assign({}, this.state, this.request.body);

    // 渲染页面
    let html;
    try {
        html = this.render(routeConf.views, body);
    } catch (err) {
        this.body = {
            code: 500,
            msg: err.message
        };
        this.status = 500;
        return false;
    }

    //做一次内容检查
    if (!html) {
        this.body = {
            code: 500,
            msg: '模板可能渲染出错,或者没有内容'
        };
        this.status = 500;
        return false;
    }

    // 压缩 html
    html = utils.compressHTML(html);

    // 生成静态文件
    const viewPath = path.join(filePath, fileName);
    try {
        fs.writeFileSync(viewPath, html, 'utf8');
        console.log(chalk.green('生成静态文件 %s 成功。'), viewPath + '/' + fileName);
        this.body = {
            code: 0,
            msg: `生成静态文件 ${viewPath + '/' + fileName} 成功。`
        };
    } catch (err) {
        console.log(chalk.red('生成静态文件 %s 失败，请检查是否有写入权限。'), viewPath + '/' + fileName);
        this.body = {
            code: 500,
            msg: `生成静态文件 ${viewPath + '/' + fileName} 失败，请检查是否有写入权限。`
        };
        this.status = 500;
        return false;
    }
};

for (let [route, routeConf] of Object.entries(staticRouterMap)) {
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
        utils.checkDirectory(filePath);
        return filePath;
    });

    router.post(route, configRouter(routeConf, filePath, fileName));
}


module.exports = router;