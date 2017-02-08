/**
 * 起点域业务的简繁体处理中间件
 * cookie透传逻辑,拆分成中间件,做koa全局state
 * Author:罗磊
 * Des:通过判断client requeset header头cookie信息,返回body.isZht供模板直出判断
 */

'use strict';


const cookies = require('cookie');


function parseCookies(cookie) {

	return cookies.parse(cookie)
}


var ChineseChecker = function() {
    return function* checkChinese(next) {
        var _thisCookie = !!this.request.header.cookie ? this.request.header.cookie : '';

        var userLang,
            isZht;
        if (!!_thisCookie) {
            if (!!(parseCookies(_thisCookie)['lang']) && parseCookies(_thisCookie)['lang'] == 'zht') {
                userLang = 'zht';
            } else {
                userLang = 'zhs';
            }
        }
        isZht = !!(userLang == 'zht') ? true : false;

        this.state = Object.assign(this.state,{
        	isZht:isZht
        })

        yield next;
    }

}


module.exports = ChineseChecker;
