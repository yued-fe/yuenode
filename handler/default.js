/**
 * 默认handler处理
 * 对于非0业务code,做单独处理
 * 后端cgi 请求的handler,针对site的非0业务code,做轻量的业务处理
 */

'use strict';
const serverDetective = require('../lib/serverDetective');

var handler = function*(router, body, requestUrl) {
    var statusCode = parseInt(body.code);
    console.log('默认handler');
    console.log("statusCode:" + statusCode);
    var _ClientURL = router.request.header.host + router.request.url;
    switch (statusCode) {
        case 1:
            body.defaultSearch = {};
            body.msg = body.msg + "\n" + body.exception;
            console.error('[LOG URL]' + _ClientURL);
            console.error('[LOG Cgi]' + requestUrl);
            throw new Error('找不到数据 后台服务端拉取数据失败')
            break;
        case 1006:
            body.defaultSearch = {};
            body.msg = body.msg + "\n" + body.exception;
            router.status = 404;
            console.error('[LOG URL]' + _ClientURL);
            console.error('[LOG Cgi]' + requestUrl);
            yield router.render('error', body);
            break;
    }
}


module.exports = handler;
