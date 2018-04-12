'use strict';

/**
 * 获得各种配置
 */

const path = require('path');
const chalk = require('chalk');
const fs = require('fs');

// 缓存读取结果以提高性能
let siteConf, originRouterMap, routerMap, serverConf, extendsLoader, staticRouterMap;

module.exports = function (opt) {
    // 接受传入参数
    if (opt && typeof opt === 'object') {
        siteConf = opt;
    }

    return {
        // 取得站点配置
        getSiteConf() {
            // 读取过直接返回
            if (!!siteConf) {
                return siteConf;
            }

            siteConf = {
                // NODE服务项目别名
                NODE_SITE: 'no_yuenode_config',
                // 当前Node服务环境
                ENV_TYPE: 'pro',
                // 是否开启L5 taf平台适用
                l5_on: false,

                // 项目配置文件夹地址
                path: '',
                // 配置文件名,默认为 server.js
                server_conf_file: 'server',
                // 动态路由映射文件或文件夹名,默认为 routermap，如果是文件夹默认加载文件夹内的index
                routermap_file: 'routermap', 
                // extends文件或文件夹名，如果是文件夹默认加载文件夹内的index，没有index的话加载loader
                extends_file: 'extends',
                // 是否开启简繁体转换功能
                character_conversion: false,

                // 是否开启静态化服务
                static_server_on: false,
                // 静态化路由配合文件,默认为 static_routermap
                static_routermap_file: 'static_routermap',
                // 静态化服务原有后端接口，后端post所有页面数据，不使用此静态化接口改为空字符串即可
                static_server_cgi: '/api/v2/setData',
                // 新静态化接口，复用动态路由，使用则注意在动态路由加入static字段，后端post请求动态路由，不需要传body数据，不使用此静态化接口改为空字符串即可
                static_dynamic_router: '/api/setStatic',
            };

            // 读取当前站点配置
            if (process.env.config) {
                siteConf = Object.assign(siteConf, JSON.parse(process.env.config));
            }
            
            return siteConf;
        },

        // 取得运行环境
        getEnv() {
            const siteConf = this.getSiteConf();
            let env = process.env.ENV_TYPE || process.env.QD_TSF_ENV ? (process.env.ENV_TYPE || process.env.QD_TSF_ENV).toLowerCase() : siteConf.ENV_TYPE;
            if (env === 'ol') {
                env = 'pro';
            }
            return env;
        },

        // 取得动态路由
        getDynamicRouterMap(){
            if (!!originRouterMap) {
                return originRouterMap;
            }
            
            const siteConf = this.getSiteConf();
            const configPath = path.join(siteConf.path, siteConf.routermap_file);
            try {
                // 读取站点路由配置
                originRouterMap = require(configPath);
            } catch (err) {
                // 没有的话空转
                console.log(chalk.red('No File %s , empty.'), configPath);
                originRouterMap = {};
            }
            return originRouterMap;
        },

        // 取得服务server配置
        getServerConf() {
            // 读取过直接返回
            if (!!serverConf) {
                return serverConf;
            }

            const siteConf = this.getSiteConf();
            const env = this.getEnv();
            const configPath = path.join(siteConf.path, siteConf.server_conf_file);
            try {
                // 读取站点路由配置
                serverConf = require(configPath);
                serverConf = serverConf.genConf ? serverConf.genConf[env] : serverConf[env];
            } catch (err) {
                // 没有的话空转
                console.log(chalk.red('No File %s , empty.'), configPath);
                serverConf = {
                    views: {
                        path: path.join(__dirname, '../views/empty')
                    },
                    index: {
                        path: path.join(__dirname, '../views/empty')
                    }
                };
            }
            return serverConf;
        },

        // 取得extends加载器
        getExtendsLoader() {
            // 读取过直接返回
            if (!!extendsLoader) {
                return extendsLoader;
            }

            const siteConf = this.getSiteConf();
            let loaderPath = path.join(siteConf.path, siteConf.extends_file);
            try {
                extendsLoader = require(loaderPath);
            } catch (err) {
                loaderPath = path.join(siteConf.path, siteConf.extends_file, 'loader');
                try {
                    extendsLoader = require(loaderPath);
                } catch (e) {
                    extendsLoader = {};
                    console.log('No extends file.');
                }
            }
            return extendsLoader;
        },

        // 取得静态路由映射
        getStaticRouterMap() {
            // 读取过直接返回
            if (!!staticRouterMap) {
                return staticRouterMap;
            }

            const siteConf = this.getSiteConf();
            const configPath = path.join(siteConf.path, siteConf.static_routermap_file);
            try {
                // 读取站点路由配置
                staticRouterMap = require(configPath);
            } catch (err) {
                // 没有的话空转
                console.log(chalk.red('No File %s , empty.'), configPath);
                staticRouterMap = {};
            }
            return staticRouterMap;
        },
    };
};

