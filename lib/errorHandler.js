'use strict';

/**
 * Module dependencies.
 * Author:luolei@yuewen.com
 */


const chalk = require('chalk');
const serverDetective = require('./serverDetective');
const NODE_ENV = serverDetective.getEnv();
const SITE_PATH = serverDetective.getSiteConf();
const serverConf = serverDetective.getServerConf();
const staticConf = serverConf['static'];
const templatePathPrefix = serverConf['views']['path_prefix'] || "";
const reload = require('./reload');


function tryRender(ctx, template, body) {
    return function*() {
        let host = ctx.req.headers['host'];
        //如果配了前缀域名，例如local.或者dev等，域名需要去除这个
        if (templatePathPrefix) {
            var pos = host.indexOf(templatePathPrefix);
            if (pos === 0) {
                host = host.substr(templatePathPrefix.length);
            }
        }
        try {
            try {
                yield ctx.render(host + '/' + 　template, body); //需要有404页面
            } catch (e) {
                console.warn(e);
                yield ctx.render(template, body); //找不到默认找根下面的404
            }
        } catch (e) {
            //异常页面，会刷新掉所有缓存
            var options = {
                root: __dirname + "/../views/"
            };
            reload.render(ctx, options)

            //直接输出错误
            console.error(e);
            yield ctx.render("error", body);

            //还原
            options = {
                root: serverConf['views']['path']
            };
            reload.render(ctx, options);

        }
    }
}


var error = function(reqInfo) {
    return function* error(next) {
        try {
            yield next;
            if (404 === this.response.status) {
                console.log(chalk.red("404 not found: ") + this.request.host + this.request.url);
                let body = {
                    code: this.status,
                    envType: NODE_ENV,
                    staticConf: staticConf,
                    defaultSearch: { 'keywords': '' }, //兼容用
                    msg: "无法找到该页面"
                };

                this.status = 404;
                yield tryRender(this, 'error', body);

            };
        } catch (err) {
            //捕获所有后续路由中产生的异常
            console.error(chalk.red("Exception!!"));
            console.error(this.request.host + this.request.url);
            // console.error(err.stack);
            this.status = err.status || 500;

            //封装error 抛出给模板
            if (NODE_ENV !== 'pro') {
                var body = {
                    code: this.status,
                    msg: err.stack,
                    envType: NODE_ENV,
                    defaultSearch: { 'keywords': '' }, //兼容用
                    staticConf: staticConf
                };

                this.set('Q_Warn', err.status);
                yield tryRender(this, 'error', body);
            } else {
                var body = {
                    code: this.status,
                    msg: '服务出错了',
                    envType: NODE_ENV,
                    defaultSearch: { 'keywords': '' }, //兼容用
                    staticConf: staticConf
                }

                yield tryRender(this, 'error', body);
            }
        }
    }
}

module.exports = error;
