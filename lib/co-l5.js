'use strict';

/**
 * L5
 */

const chalk = require('chalk');
const thunk = require('thunkify');
const L5 = require('@tencent/cl5');
const serverConf = require('./getConfigs.js').getServerConf();
const L5_CONF = serverConf.cgi.L5;

const ApiGetRoute = thunk(L5.ApiGetRoute);
const ApiRouteResultUpdate = thunk(L5.ApiRouteResultUpdate);

function* getAddr() {
    try {
        let addr = yield ApiGetRoute({
            modid: L5_CONF.conf.MODID, //唯一MODID
            cmd: L5_CONF.conf.CMDID, //唯一CMDID
            timeout: 0.2,
            debug: false
        });
        addr = addr[0].ip + ':' + addr[0].port;
        console.log(chalk.green('l5取得ip:'), addr);
        return addr;
    } catch (err) {
        console.log(chalk.red('L5请求ip失败，使用serverConf配置ip:'), serverConf.cgi.ip);
        console.log(err);
        return serverConf.cgi.ip;
    }
}

exports.getAddr = getAddr;
exports.apiRouteResultUpdate = ApiRouteResultUpdate;
