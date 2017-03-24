'use strict';

/**
 * 静态化服务
 */

const router = require('koa-router')();
const chalk = require('chalk');
const dateFormat = require('dateformat');
const fs = require('fs');
const path = require('path');

const getConfigs = require('../lib/getConfigs.js');
const staticRouterMap = getConfigs.getStaticRouterMap();
const serverConf = getConfigs.getServerConf();
const siteConf = getConfigs.getSiteConf();

// 静态文件根目录
let staticRoot;

// 压缩配置
let minifyConf = {
    collapseWhitespace: true,    //删除空格
    collapseInlineTagWhitespace: true    //删除行内属性空格
};

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

// 启动时先检查一下静态资源文件根目录是否存在
(function checkStaticRootPath() {
    // 读取静态文件根目录配置
    const staticPath = serverConf.index.split('/').filter(n => n !== '');
    let pathArr = ['', ...staticPath];

    // 保存静态文件根目录
    staticRoot = pathArr.join('/');

    // 检查是否存在，不存在则创建
    pathArr.reduce((pre, next) => {
        let curPath = pre + '/' + next;
        checkDirectory(curPath);
        return curPath;
    });
}());

/**
 * 静态化处理函数
 * @param  {object} routeConf 路由配置
 * @param  {string} filePath  要生成的文件路径
 * @param  {string} fileName  要生成的文件名
 */
const configRouter = (routeConf, filePath, fileName) => function staticRoutersHandler() {
    const result = this.request.body;
    console.log(chalk.blue('匹配到当前静态路由配置：\n'), routeConf);

    console.log(arguments);

    // 默认封装一个全局性的<%= pageUpdateTime %>变量供静态页面标记更新时间用,传入请求数据、state数据用于渲染
    const updateTimeStamp = result.timeStamp ? result.timeStamp : (new Date()).getTime();
    let body = Object.assign({
        pageUpdateTime: dateFormat(updateTimeStamp, "yyyy-mm-dd,HH:MM:ss")
    }, this.state, this.request.body);

    // 渲染页面
    let html;
    try {
        html = this.render(routeConf.views, body);
    } catch (err) {
        this.body = {
            code: 500,
            msg: err.stack
        };
        return false;
    }

    //做一次内容检查
    if (!html) {
        this.body = {
            code: 500,
            msg: '模板可能渲染出错,或者没有内容'
        };
        return false;
    }

    // 如果站点配置中开启了静态化文件压缩，则执行压缩
    if (!!siteConf.minify_static_file) {
        const minify = require('html-minifier').minify;
        try {
            // 压缩HTML
            let minifyHtml = minify(html, minifyConf);
            html = minifyHtml;
        } catch (err) {
            // 若压缩失败,则使用原始HTML,且在尾部增加tag标记,供debug用
            html += '<!-- min -->';
            console.log(chalk.red('HTML压缩失败: \n'), err);
        }
    }

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
        checkDirectory(filePath);
        return filePath;
    });

    
    router.post(route, configRouter(routeConf, filePath, fileName));
}

module.exports = router;