'use strict';

/**
 * 通用函数
 */

const url = require('url');
const chalk = require('chalk');
const request = require('co-request');

const getConfigs = require('./getConfigs.js');
const serverConf = getConfigs.getServerConf();
const siteConf = getConfigs.getSiteConf();
const NODE_ENV = getConfigs.getEnv();

module.exports = {

    // 去除host前缀，例如local、dev等，去除端口号
    fixHost(host) {
        const reg = new RegExp('^' + NODE_ENV, 'i');
        host = host.replace(reg, '');
        host = host.replace(/:\d*$/, '');
        return host;
    },

    /**
     * 处理cgi，补全协议、ip，合并query
     * @param   cgi        routerMap中的原始cgi
     * @param   params     类似 /book/:bookId/forum 这种请求url中的变量，从router中取得
     * @param   reqQuery   请求的query，与params共同用于合并出最后的query
     */
    fixCgi: function* (cgi, params, reqQuery) {

        // 根据环境变量取得协议名，根据配置获得当前环境后端请求地址
        const protocol = !!siteConf.cgi_ssl_on ? 'https:' : 'http:';
        const urlObj = url.parse(cgi, true, true);

        /**
         * 如果在站点配置中开启L5，则通过L5获得后台服务IP或者域名，否则默认使用配置文件中的ip地址
         * 由于L5需要服务器环境支持(依赖底层库),本地调试不载入L5模块防止出错。
         */
        let ip = serverConf.cgi.ip;
        if (!!siteConf.l5_on) {
            // 检查能否启用L5
            if (NODE_ENV !== 'local' && !serverConf.cgi.L5 && !serverConf.cgi.L5.enable) {
                const L5 = require('../lib/co-l5.js');
                const addr = yield L5.getAddr();

                console.log(chalk.yellow('L5 返回：'), addr);
                // 如果取得则使用
                if (!!addr) {
                    ip = addr;
                }
            }
        }

        let fixedCgi = {
            // 如果cgi有协议则采用，没有则根据环境变量添加
            protocol: (!!urlObj.protocol ? urlObj.protocol : protocol),
            // 如果cgi有域名则采用，没有则根据配置文件添加
            host: (!!urlObj.host ? urlObj.host : ip),
            pathname: urlObj.pathname,
            // 合并query，权重: 请求 query < cgi query < 请求url变量
            query: Object.assign(reqQuery, urlObj.query, params)
        };

        return {
            cgiUrl: url.format(fixedCgi),
            addr: ip
        };
    },

    /**
     * 请求后端数据
     * @param  url           处理过的url
     * @param  headers       请求header
     * @param  options       请求选项
     */
    requestCgi: function* (url, headers, options) {
        let opt = {
            'uri': url,
            'method': 'GET',
            'headers': headers,
            'gzip': true, //支持自动解析gzip
            'timeout': 5000,
            'followRedirect': false
        };

        if (options) {
            Object.assign(opt, options);
        }
        let result, spendTime;
        try {
            console.log(chalk.blue('尝试请求后端:'), opt.uri);
            const startTime = Date.now();
            result = yield request(opt);
            spendTime = (Date.now() - startTime) / 1000;
            console.log(chalk.blue('后端返回:'), result.statusCode, chalk.gray(spendTime + 's'));
        } catch (err) {
            err.message = '请求后端接口失败: ' + err.message;
            throw err;
        }
        return {result, spendTime};
    },

    // 压缩html
    compressHTML(html){
        // 如果站点配置中开启了静态化文件压缩，则执行压缩
        if (!!siteConf.compressHTML) {
            const minify = require('html-minifier').minify;
            try {
                // 压缩HTML
                let minifyHtml = minify(html, {
                    collapseWhitespace: true,    //删除空格
                    collapseInlineTagWhitespace: true    //删除行内属性空格
                });
                html = minifyHtml;
            } catch (err) {
                // 若压缩失败,则使用原始HTML,且在尾部增加tag标记,供debug用
                html += '<!-- min -->';
                console.log(chalk.red('HTML压缩失败: \n'), err);
            }
        }
        return html;
    }

};