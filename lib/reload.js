/**
 * reload 热加载文件
 */

'use strict';


function cleanCache(modulePath) {
    var module = require.cache[modulePath];
    require.cache[modulePath] = null;
}

//刷新render
function reloadRender(ctx, options) {
	console.log("reload render begin");

	var _options = {
		layout: false,
        viewExt: 'html',
        cache: true,
        debug: false
	};

	Object.assign(_options,options);

	console.log(_options);

    cleanCache(require.resolve('../middleware/koa-qidian-ejs'));
   	var render = require('../middleware/koa-qidian-ejs');

	ctx.app.context.render = null;

	render(ctx.app, _options);

	console.log("reload render ok");
}


exports.render = reloadRender;
