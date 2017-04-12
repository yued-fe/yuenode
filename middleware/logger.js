/**
 * 请求记录中间件
 */

const Counter = require('passthrough-counter');
const humanize = require('humanize-number');
const bytes = require('bytes');
const chalk = require('chalk');

/**
 * TTY check for dev format.
 */

const isatty = process.stdout.isTTY;

/**
 * Expose logger.
 */

module.exports = dev;

/**
 * Color map.
 */

const colorCodes = {
  5: 'red',
  4: 'yellow',
  3: 'cyan',
  2: 'green',
  1: 'green',
  0: 'yellow'
};

/**
 * Development logger.
 */

function dev(opts) {
  return function *logger(next) {
    // request
    const start = Date.now();
    console.log(
      chalk.magenta.bold(' --> ') + 
      chalk.bold(' %s') + 
      chalk.gray(' %s'),

      this.method,
      this.originalUrl);

    try {
      yield next;

      // 404
      if (this.status === 404) {
        let err = new Error('Not Found');
        err.status = 404;
        err.stack = `"${this.path}": Not Found`;
        throw err;
      }
    } catch (err) {
      // log uncaught downstream errors
      log(this, start, null, err);
      throw err;
    }

    // calculate the length of a streaming response
    // by intercepting the stream with a counter.
    // only necessary if a content-length header is currently not set.
    const length = this.response.length;
    const body = this.body;
    let counter;
    if (!length && body && body.readable) {
      this.body = body
        .pipe(counter = Counter())
        .on('error', this.onerror);
    }

    // log when the response is finished or closed,
    // whichever happens first.
    const ctx = this;
    const res = this.res;

    const onfinish = done.bind(null, 'finish');
    const onclose = done.bind(null, 'close');

    res.once('finish', onfinish);
    res.once('close', onclose);

    function done(event){
      res.removeListener('finish', onfinish);
      res.removeListener('close', onclose);
      log(ctx, start, counter ? counter.length : length, null, event);
    }
  };
}

/**
 * Log helper.
 */

function log(ctx, start, len, err, event) {
  // get the status code of the response
  const status = err ? (err.status || 500) : (ctx.status || 404);

  // set the color of the status code;
  const s = status / 100 | 0;
  const color = colorCodes[s];

  // get the human readable response length
  let length;
  if (~[204, 205, 304].indexOf(status)) {
    length = '';
  } else if (!len) {
    length = '-';
  } else {
    length = bytes(len);
  }

  const upstream = err ? chalk.bgRed.white.bold(' xxx ')
    : event === 'close' ? chalk.bgYellow.white.bold(' -x- ')
    : chalk.bgGreen.white.bold(' <-- ');

  console.log(
    upstream +
    chalk.gray(' %s') +
    chalk[color](' %s') +
    chalk.gray(' %s') +
    chalk.gray(' %s \n'),

    ctx.originalUrl,
    status,
    time(start),
    length
  );
}

/**
 * Show the response time in a human readable format.
 * In milliseconds if less than 10 seconds,
 * in seconds otherwise.
 */

function time(start) {
  let delta = Date.now() - start;
  delta = delta < 1000 ? delta + 'ms' : (delta / 1000) + 's';
  return humanize(delta);
}
