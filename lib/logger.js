'use strict';

/**
 * 文件日志系统
 * Author:luolei@yuewen.com
 * Des:记录日志中间件
 */



const chalk = require('chalk');

const STATUS_COLORS = {
	error: 'red',
	warn: 'yellow',
	info: 'green'
};


/**
 * Logger
 *
 * @param {object} winstonInstance
 */
function logger(winstonInstance) {
	return function* middleWare(next) {
		const start = new Date();
		yield next;
		const ms = new Date() - start;

		let logLevel;
		if (this.status >= 500) {
			logLevel = 'error';
		} else if (this.status >= 400) {
			logLevel = 'warn';
		} else if (this.status >= 100) {
			logLevel = 'info';
		}

		let msg = (chalk.gray(`${this.method} ${this.originalUrl}`) +
			chalk[STATUS_COLORS[logLevel]](` ${this.status} `) +
			chalk.gray(`${ms}ms`));

		winstonInstance.log(logLevel, msg);
	};
}


module.exports = logger;