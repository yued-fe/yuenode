'use strict';

/**
 * 起点域业务header cookie和useragent中间件
 * Author:罗磊
 * 为了给模板端更强大的业务判断能力,
 * 模板中可以直接通过 <%= CLIENT_URL %> 和 <%= CLIENT_UA %>来获得浏览器端信息
 * <%= LOCATION.{key} %>
 * {
    protocol: 'http:',
    slashes: true,
    auth: null,
    host: 'localm.qidian.com:10301',
    port: '10301',
    hostname: 'localm.qidian.com',
    hash: null,
    search: null,
    query: null,
    pathname: '/error',
    path: '/error',
    href: 'http://localm.qidian.com:10301/error'
  }
 */

var url = require("url");

var ClientHeader = function() {
  return function* ClientRequestHandler(next) {
    var _thisHeader = this.request.header;
    var _thisCookie = !!_thisHeader.cookie ? _thisHeader.cookie : '';
    var _thisUserAgent = !!_thisHeader['user-agent'] ? _thisHeader['user-agent'] : 'NO USER-AGENT SET';
    var _thisClientUrl = this.request.href;
    var _thisUrlParse = url.parse(_thisClientUrl);
    this.state = Object.assign(this.state, {
      CLIENT_URL: _thisClientUrl,
      cookie: _thisCookie,
      CLIENT_COOKIE: _thisCookie,
      CLIENT_UA: JSON.stringify(_thisUserAgent, null, 4),
      LOCATION:_thisUrlParse
    })

    console.log(this.state);
    yield next;
  }

}


module.exports = ClientHeader;