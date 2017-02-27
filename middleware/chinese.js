/**
 * 业务的简繁体处理中间件
 * Author:罗磊
 * Des:通过判断cookie中的lang字段,返回body.isZht供模板直出判断
 */

'use strict';


const cookies = require('cookie');


function parseCookies(cookie) {
	return cookies.parse(cookie)
}

var ChineseChecker = function() {
    return function* checkChinese(next) {
        var userCookie = !!this.request.header.cookie ? this.request.header.cookie : '';

        var userLang,isZht;

        if (!!userCookie) {
            if (!!(parseCookies(userCookie)['lang']) && parseCookies(userCookie)['lang'] === 'zht') {
                userLang = 'zht';
            } else {
                userLang = 'zhs';
            }
        }
        isZht = !!(userLang === 'zht') ? true : false;

        this.state = Object.assign(this.state,{
        	isZht:isZht
        })

        yield next;
    }

}


module.exports = ChineseChecker;
