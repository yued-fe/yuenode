/**
 * QidianDynamicNodeServer
 * 后端cgi 请求的handler,针对每个site,做轻量的业务处理
 */

'use strict';

const handler = function (router, body, requestUrl) {
    const _statusCode = parseInt(body.code);
    console.log("handler qd");
    console.log("statusCode:" + _statusCode);
    const _ClientURL = router.request.header.host + router.request.url;
    switch (_statusCode) {
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
            router.render('error', body);
            break;
    }
}


module.exports = handler;
