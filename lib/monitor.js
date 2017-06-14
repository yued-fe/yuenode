'use strict';

/**
 * taf stat 上报
 *
 * 如果要使用，package.json 中要添加 "@tencent/taf-monitor": "^1.0.5"
 *
 *  const Monitor = require('../lib/monitor');
    monitor = new Monitor();

    const ip_port = addr.split(':');
    m_options = {
        slaveIp: ip_port[0],
        slaveName: process.env.NODE_SITE || NODE_ENV,
        slavePort: ip_port[1] || 80,
        interfaceName: currentConf.cgi,
    };

    m_options.returnValue = body.code;
    monitor.report(m_options, 2, spendTime);
 */

const chalk = require('chalk');
const getConfigs = require('./getConfigs.js');
const siteConf = getConfigs.getSiteConf();
const IP = getConfigs.getIP();

const Monitor = function() {
    this.options = {
        masterIp: IP,
        masterName: 'NodeServer',
        slaveIp: '',
        slaveName: '',
        slavePort: '',
        returnValue: 0,
        interfaceName: '',
        bFromClient: false
    };

    if(!!siteConf.stat) {
        this.stat = require('@tencent/taf-monitor').stat;
    }
};

Monitor.prototype.report = function(options,succ,timeout) {
    if(options) {
        Object.assign(this.options, options);
    }

    if(this.stat) {
        
        let type, consoleText;
        if (succ == 1) {
            type = this.stat.TYPE.SUCCESS;
            consoleText = 'SUCCESS';
        }
        else if(succ == 2) {
            type = this.stat.TYPE.ERROR;
            consoleText = 'ERROR';
        }
        else {
            type = this.stat.TYPE.TIMEOUT;
            consoleText = 'TIMEOUT';
        }

        console.log(chalk.blue('Do taf monit:'), consoleText);

        this.stat.report(this.options,type,timeout);
    }
};

module.exports = Monitor;
