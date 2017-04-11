'use strict';

/**
 * 为 koa 注入 render 方法用于模板渲染服务
 */

const path = require('path');
const ejs = require('ejs');
const chalk = require('chalk');

const siteConf = require('../lib/getConfigs.js').getSiteConf();

/**
 * default render options
 * @type {Object}
 */

const defaultSettings = {
    // 模板文件后缀名，默认为'.html'
    viewExt: '.html',
    // 是否缓存，默认缓存
    cache: true,
    // 是否开启debug，默认不开启
    debug: false,
    // 分隔符
    delimiter: '%'
    // 另有 root 属性，必需，存放模版文件的文件夹路径，需传入
};

/**
 * set app.context.render
 *
 * usage:
 * ```
 * this.render('user', {name: 'dead_horse'});
 * ```
 * @param {Application} app koa application instance
 * @param {Object} settings user settings
 */
module.exports = function (app, settings) {
    if (app.context.render) {
        return;
    }

    if (!settings || !settings.root) {
        throw new Error(chalk.red('调用 ejsRender 没有传入必须参数 settings.root'));
    }

    settings.root = path.resolve(process.cwd(), settings.root);

    settings = Object.assign(defaultSettings,settings);

    // 如果配置中开启了支持 inline-ejs，则会将重写 ejs 的读取文件方法
    if (!!siteConf.inline_ejs) {
        require('../lib/supportInlineEjs.js')(settings.delimiter);
    }

    /**
     * generate html with view name and options
     * @param {String} view
     * @param {Object} options
     * @return {String} html
     */
    function render(view, options) {
        // 处理绝对路径和后缀，生成绝对路径
        view += view.endsWith(settings.viewExt) ? '' : settings.viewExt;
        let viewPath = path.join(settings.root, view);

        // 调用原生 ejs.renderFile 方法
        return ejs.renderFile(viewPath, options, (err, str) => {
            if (err) {
                console.log(chalk.red('ejs 渲染出错 \n'), err.stack);
                throw err;
            }
            return str;
        });
    }

    app.context.render = function (view, _context) {
        // 将 setting 和 state、 render 传入的内容合并，供模板渲染使用
        let context = Object.assign({
            cache: settings.cache,
            debug: settings.debug,
            delimiter: settings.delimiter
        }, this.state, _context);

        let html = render(view, context);

        // 返回内容
        return html;
    };
};
