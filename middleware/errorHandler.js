'use strict';

/**
 * 错误处理中间件，将所有抛出的错误在此统一处理
 */

const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

const utils = require('../lib/utils.js');
const getConfigs = require('../lib/getConfigs.js');
const serverConf = getConfigs.getServerConf();
const NODE_ENV = getConfigs.getEnv();

module.exports = function onerror(app) {

    app.context.onerror = function(err) {
        // don't do anything if there is no error.
        // this allows you to pass `this.onerror`
        // to node-style callbacks.
        if (err === null) {
            return;
        }

        // wrap non-error object
        if (!(err instanceof Error)) {
            const newError = new Error('non-error thrown: ' + err);
            // err maybe an object, try to copy the name, message and stack to the new error instance
            if (err) {
                if (err.name) newError.name = err.name;
                if (err.message) newError.message = err.message;
                if (err.stack) newError.stack = err.stack;
                if (err.status) newError.status = err.status;
            }
            err = newError;
        }

        console.log(chalk.red('errorHandle:'),'"'+this.path+'"', err.message, '\n');
        
        // ENOENT support
        if (err.code === 'ENOENT') {
            err.status = 404;
        }

        if (typeof err.status !== 'number') {
            err.status = 500;
        }
        this.status = err.status;

        // 渲染错误数据
        let body = {
            code: this.status,
            envType: NODE_ENV,
            staticConf: serverConf.static,
            defaultSearch: { 'keywords': '' }, //兼容用
            msg: err.message,
            stack: NODE_ENV ==='pro' ? 'Something went wrong.' : err.stack
        };

        // 渲染状态码错误页
        try {
            const page = `error/${this.status}.html`;
            try {
                // 渲染项目模板中的状态码错误页
                const host = utils.fixHost(this.host);
                const errPath = path.join(serverConf.views.path, host, page);
                fs.statSync(errPath);
                this.body = this.render(path.join(host, page), body);
            } catch (err) {
                // 没有的话渲染项目views根目录中的状态码错误页
                const errPath = path.join(serverConf.views.path, page);
                fs.statSync(errPath);
                this.body = this.render(page, body);
            }

        // 没有配置状态码错误页则渲染error.html
        } catch (err) {
            try {
                // 渲染项目模板中的error.html
                const host = utils.fixHost(this.host);
                const errPath = path.join(serverConf.views.path, host, 'error.html');
                fs.statSync(errPath);
                this.body = this.render(path.join(host,'error'), body);
            } catch (err) {
                try {
                    // 没有的话渲染项目views根目录中的error.html
                    const errPath = path.join(serverConf.views.path, 'error.html');
                    fs.statSync(errPath);
                    this.body = this.render('error', body);
                } catch (err) {
                    // 没有的话使用框架机中的error页面，不使用render防止是渲染出错
                    const errPath = path.join(process.cwd(), 'views/error.html');
                    let errTxt = fs.readFileSync(errPath, 'utf8');
                    this.body = errTxt
                        .replace('{{code}}', body.code)
                        .replace('{{msg}}', body.msg)
                        .replace('{{stack}}', body.stack);
                }
            }
        }

        this.res.end(this.body);
    };
};
