/**
 * Author:luolei
 * Module dependencies.
 * 获得服务器和环境相关信息
 */

'use strict';

const koa = require('koa');
const app = koa();
const os = require('os');
const interfaces = os.networkInterfaces();


/**
 * [*getOsNetInfo 获得机器IP地址
 * @param {Function} next          [description]
 * @yield {[type]}   [description]
 */
function* getOsNetInfo(next) {
    let addresses = [];
    for (let k in interfaces) {
        for (let k2 in interfaces[k]) {
            let address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
                addresses.push(address.address);
            }
        }
    }
    yield addresses;
}

exports.getIP = function() {
    var ip = process.env.IP;
    if (!ip) {
        let getIP = getOsNetInfo();
        ip = getIP.next().value[0];
    }
    return ip;
}

/**
 * [*getOsNetInfo 获得机器Node环境
 * @param {Function} next          [description]
 * @yield {[type]}   [description]
 */

function getEnv() {
    app.env = process.env.NODE_ENV || "local";
    return app.env;
}

//get站点配置
function getSiteConf() {

    // 设置默认参数
    var options = {
        "host": "",
        "port": "",
        "stat": "",
        "path": "",
        "static_conf_file": "",
        "server_conf_file": "",
        "routermap_file": "",
        "static_routermap_file": ""
    }

    var site = process.env.NODE_SITE || "local";
    var siteConf;
    // 配置改由环境变量形式配置,原先的config文件方式逐渐弃用
    // 环境变量 CONFIG_FILE 设置为 on 时,兼容旧有配置文件形式
    if(process.env.CONFIG_FILE === 'on'){
        var conf = require("../config/" + site);
        siteConf = conf[env];
    }else{
        siteConf =Object.assign(options,process.env)
    }


    if (!siteConf) {
        throw new Error('siteConf 错误，确认环境变量是否正确');
    }
    return siteConf;
}

exports.isDebug = function() {
    var env = getEnv()
    return (env === "local" || env === "dev" || getSiteConf()["debug"]) ? true : false;
}


//返回服务server配置
exports.getServerConf = function() {
    var siteConf = getSiteConf();
    var server_conf_file = siteConf['server_conf_file'] || "server";
    var path = siteConf['path'] + "/" + server_conf_file;
    var serverConf = require(path);
    var env = getEnv();
    return serverConf.genConf[env];
}

//返回动态路由配置
exports.getRouterMapConf = function() {
    var siteConf = getSiteConf();
    var routermap = siteConf['routermap_file'] || "routermap";
    var path = siteConf['path'] + "/" + routermap;
    return require(path);
}

//返回静态API路由配置:需主要这是框架机本身暴露给外部服务的接口
exports.getStaticRouterMapConf = function() {
    var siteConf = getSiteConf();
    var routermap = siteConf['static_routermap_file'] || "static_routermap";
    var path = siteConf['path'] + "/" + routermap;
    return require(path);
}



//返回路由映射
exports.getDomainMap = function() {
    var siteConf = getSiteConf();
    var server_conf_file = siteConf['server_conf_file'] || "server";
    var path = siteConf['path'] + "/" + server_conf_file;
    console.log(path);
    var serverConf = require(path);
    var domainMap = serverConf.domainMap;
    console.log(domainMap);
    return domainMap;
}


//返回extends加载器路径
exports.getExtendsLoader = function() {
    var siteConf = getSiteConf();
    var path = siteConf['path'] + "/extends/" + 'loader';
    return path;
}

//require站点配置
exports.getSiteConf = getSiteConf;
//取环境
exports.getEnv = getEnv;
