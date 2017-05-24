'use strict';

/**
 * taf stat 上报
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

        console.log(chalk.blue('执行taf上报:'), consoleText);

        this.stat.report(this.options,type,timeout);
    }
};

module.exports = Monitor;
