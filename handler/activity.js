/**
 * 后端cgi 请求的handler,针对每个site,做轻量的业务处理
 */

'use strict';

const handler = function (router, body, requestUrl) {
    const _statusCode = parseInt(body.code);
    console.log("handler activity");
    console.log("statusCode:" + _statusCode);
    switch (_statusCode) {
        case 1:
            body.msg = body.msg + "\n" + body.exception;
            router.render('error', body);
            break;
        case 1001:
            router.redirect(body.jumpUrl);
            break;
        default:
            router.redirect('http://write.qq.com');
            break;
    }
}


module.exports = handler;
