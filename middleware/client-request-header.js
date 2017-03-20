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

const url = require('url');
const serverDetective = require('../lib/serverDetective');
const serverConf = serverDetective.getServerConf();


var ClientHeader = function() {
  return function* ClientRequestHandler(next) {

    var userHeader = this.request.header;
    var userCookie = !!userHeader.cookie ? userHeader.cookie : '';
    var userUA = !!userHeader['user-agent'] ? userHeader['user-agent'] : 'NO USER-AGENT SET';
    var userClientUrl = this.request.protocol + '://' + ( serverConf.domainPrefix || '') +  this.req.headers.host + this.request.url;
    var userUrlParse = url.parse(userClientUrl);

    // 将业务中较常使用到的COOKIE,UA,URL 等信息作为通用信息抛给前端业务方使用
    this.state = Object.assign(this.state, {
      CLIENT_URL: userClientUrl,
      cookie: userCookie,
      CLIENT_COOKIE: userCookie,
      CLIENT_UA: JSON.stringify(userUA, null, 4),
      LOCATION:userUrlParse
    })

    console.log('=====asd===a===a=sd==a=d=asd=')
    console.log(this.state);
    yield next;
  }

}


module.exports = ClientHeader;