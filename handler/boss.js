/**
 * 后端cgi 请求的handler,针对每个site,做轻量的业务处理
 */

'use strict';

const handler = function (router,body,requestUrl) {
	const _statusCode = parseInt(body.code);
	console.log("handler boss");
	console.log("statusCode:" + _statusCode);
	switch (_statusCode) {
        case 1004:
            router.redirect('/login?from=' + encodeURIComponent(router.request.href));
            break;
        case 1005:
            throw new Error('页面未授权' + requestUrl);
            break;
        case 1006:
            //访问地址不存在
            router.redirect('/404?from=' + encodeURIComponent(router.request.href));
            break;
        case 1007:
            //未登录
            router.redirect('/login?redirect=' + encodeURIComponent(router.request.href));
            break;
        case 500:
        	body.msg = body.msg + "\n" + body.exception;
            router.render('error', body);
            break;
    }
}


module.exports = handler;