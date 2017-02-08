/**
 * stat 上报
 */

'use strict';
const serverDetective = require('./serverDetective');

var monitor = function() {
	this.options = {
		"masterIp"  : process.env.IP,
		"masterName":"NodeServer",
		"slaveIp"   :"",
		"slaveName" :"",
		"slavePort" :"",
		"returnValue":0,
		"interfaceName":"",
		"bFromClient" : false
	};

	const NODE_ENV = serverDetective.getEnv();
	if(NODE_ENV !== "local") {
		this.stat = require('@tencent/taf-monitor').stat;
	}
}

monitor.prototype.report = function(options,succ,timeout) {
	if(options) {
		Object.assign(this.options, options);
	}
	console.log(this.options);
	if(this.stat) {
		console.log("monitor do report");
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
}

module.exports = monitor;
