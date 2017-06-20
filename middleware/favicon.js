'use strict';

/**
 * 处理favicon路由逻辑
 * 由于有些浏览器默认请求 host/favicon.ico,为防止运维无配置相关nginx,导致框架机大量404错误请求,yuenode做兼容处理。
 * 看到这段注释后让运维人员去配置以规范
 * 参考:https://serverfault.com/questions/308299/how-to-set-a-favicon-ico-for-a-specific-virtual-host-on-nginx
 */

const fs = require('fs');
const path = require('path');

const serverConf = require('../lib/getConfigs.js').getServerConf();
const iconPath = path.join(serverConf.views.path, '/favicon.ico');

module.exports = () => function* favicon(next) {
    if ('/favicon.ico' !== this.path) {
        return yield next;
    }

    if ('GET' !== this.method && 'HEAD' !== this.method) {
        this.status = 'OPTIONS' === this.method ? 200 : 405;
        this.set('Allow', 'GET, HEAD, OPTIONS');
        return;
    }

    this.set('Cache-Control', 'public, max-age=86400');
    this.type = 'image/x-icon';
    this.body = fs.readFileSync(iconPath);
};