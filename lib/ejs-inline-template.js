/**
 * 重写 ejs compile 方法, 提供忽略 <script type="text/ejs-template"></script> 功能
 */

var ejs = require('ejs');

var originCompile = ejs.compile;

var REG_INLINE_TEMPLATE = /<script\b[^>]*type="text\/ejs-template"[^>]*>([\s\S]*?)<\/script>/gm;

ejs.compile = function (template, options) {
    var matched = template.match(REG_INLINE_TEMPLATE);

    if (matched) {
        var delimiter = options.delimiter || '%';

        matched.forEach(function (input) {
            // 将 text/ejs-template 内容中的 '<%' 替换成 '<%%', 后续由 ejs 还原, 这样就不会被编译
            var temp = replace(input, '<' + delimiter, '<' + delimiter + delimiter);

            // 将 text/ejs-template 内容中的 '<%%%' 替换成 '<%', 后续由 ejs 编译
            var output = replace(temp, '<' + delimiter + delimiter + delimiter, '<' + delimiter);

            template = template.replace(input, output);
        });
    }

    return originCompile.call(null, template, options);
};

function replace(str, replaceFrom, replaceTo) {
    replaceFrom = new RegExp(replaceFrom, 'gm');

    return str.replace(replaceFrom, replaceTo);
}
