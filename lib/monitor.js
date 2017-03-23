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
        console.log(chalk.blue('执行taf上报，内容：\n'), this.options);
        
        let type;
        if (succ == 1) {
            type = this.stat.TYPE.SUCCESS;
        }
        else if(succ == 2) {
            type = this.stat.TYPE.ERROR;
        }
        else {
            type = this.stat.TYPE.TIMEOUT;
        }

        this.stat.report(this.options,type,timeout);
    }
};

module.exports = Monitor;
