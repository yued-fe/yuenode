/**
 * 检查build生成的路径是否存在
 * Author:luolei
 */

'use strict';

const co = require('co');
const fs = require('co-fs');
const chalk = require('chalk');
const _ = require('lodash');


const serverDetective = require('./serverDetective');
const serverConf = serverDetective.getServerConf(); //获得路由
const NODE_ENV = serverDetective.getEnv();
const SITE_CONF = serverDetective.getSiteConf();
const staticRouterMap = serverDetective.getStaticRouterMapConf();

const externalConfPath = serverConf['path'];

/**
 * 用于监测和创建文件目录的组件
 */
const
    filesDetective = require('./filesDetective.js')


/**
 * 载入通配路由规则
 */

var routerMap = staticRouterMap;

// console.log(routerMap);


module.exports = {
    /**
     * 初始化静态化路径检查
     * @return {[type]} [description]
     */

    init: function() {
        this.checkLength();
    },
    /**
     * 检查需要生成的目录个数
     * @return {[type]} [description]
     */
    checkLength: function() {
        var _folderCheckLength = Object.keys(routerMap).length;
        console.log('检查' + chalk.red(_folderCheckLength) + '个路由规则对应的静态化目录是否存在');
        for (var routerVal in routerMap) {
            var _routerVal = routerVal,
                _staticPathVal = routerMap[routerVal];
            this.checkFolder(_staticPathVal)
        }
    },

    /**
     * 遍历生成所需要的文件夹
     * @param  {[type]} path [description]
     * @return {[type]}      [description]
     */
    checkFolder: function(path) {
        var _staticPathVal = path.static;
        console.log('检查' + JSON.stringify(path));
        var _splitStaticPath = _staticPathVal.split('/');

        console.log(_splitStaticPath);
        var _splitStaticPathExtract = _.filter(_splitStaticPath, function(n) {
                return n !== '';
            })

        _splitStaticPathExtract = _.dropRight(_splitStaticPathExtract)

        //获得最终生成的文件名,强制要求均以index.html或者fileName.index结尾
        var _staticFileName = _.takeRight(_splitStaticPath),
            _staticFileNameRaw = _staticFileName[0].split('.html')[0];
        var _staticFilePathRaw = _splitStaticPathExtract.join('/');
        /**
         * 根据本地、线上环境区分,在指定位置创建文件夹
         */

        var _checkPath = '';
        // 创建根路径
        filesDetective.checkDirectorySync(serverConf.index);
        for (var i = 0; i < _splitStaticPathExtract.length; i++) {
            _checkPath += '/' + _splitStaticPathExtract[i];
            console.log(_checkPath);
            console.log(chalk.red('检查路径:') + serverConf.index + _checkPath);
            filesDetective.checkDirectorySync(serverConf.index + _checkPath);

            if (i == _splitStaticPathExtract.length - 1) {
                console.log(chalk.green('==目录' + chalk.blue(_checkPath) + ' 检验完毕=='));
            }
        }

    }
}