'use strict';

/**
 * Author:luolei
 * Module dependencies.
 * 处理文件和文件夹相关
 */
const co = require('co');
const fs = require('co-fs');
const chalk = require('chalk');
const serverDetective = require('../lib/serverDetective');
const serverSiteConf = serverDetective.getSiteConf();//获得业务配置
const serverConf = serverDetective.getServerConf(); // 获得环境配置
const externalConfPath = serverSiteConf['path'];
const staticConf = serverConf['static'];

/**
 * 检查文件夹是否存在,若不存在则创建
 * 注意服务器端用户文件读写权限
 */
exports.checkDirectorySync = function(directory) {
    co(function*() {
        try {
        	console.log('检查一下' + directory);
            yield fs.stat(directory);
        } catch (e) {
        	console.log(e);
            console.log(chalk.red('创建目录: ' + chalk.blue(directory)));
            yield fs.mkdir(directory);
        }
    })
}

