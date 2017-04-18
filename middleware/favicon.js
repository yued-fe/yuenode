'use strict';

/**
 * 处理favicon路由逻辑
 */

const fs = require('fs');
const path = require('path');

const serverConf = require('../lib/getConfigs.js').getServerConf();
const rootPath = typeof serverConf.views === 'string' ? serverConf.views : serverConf.views.path;
const iconPath = path.join(rootPath, '/favicon.ico');


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