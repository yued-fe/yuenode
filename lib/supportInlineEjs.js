'use strict';

/**
 * 根据配置文件开关，重写 ejs 的读取文件方法
 * ejs v2 能够注入干预模版编译且能够对 include 产生效果的地方只有 ejs.fileLoader，所以在此注入
 */

const ejs = require('ejs');
const fs = require('fs');

const siteConf = require('../lib/getConfigs.js').getSiteConf();

// 可自定义 script 标签的 type 属性，默认为 text/ejs-template
const reg = `<script\\b[^>]*type="${siteConf.inline_ejs_type || 'text/ejs-template'}"[^>]*>([\\s\\S]*?)<\\/script>`;
const REG_INLINE_TEMPLATE = new RegExp(reg, 'gm');

module.exports = function rewriteEjsFileLoader(delimiter) {
    // 重写 ejs 的读取文件方法, 提供忽略 <script type="text/ejs-template"></script> 功能
    ejs.fileLoader = function (filepath) {
        let template = fs.readFileSync(filepath, 'utf8');

        let matched = template.match(REG_INLINE_TEMPLATE);

        if (matched) {
            delimiter = delimiter || '%';

            matched.forEach(function (input) {
                // 将 text/ejs-template 内容中的 '<%' 替换成 '<%%', 后续由 ejs 还原, 这样就不会被编译
                let temp = replace(input, '<' + delimiter, '<' + delimiter + delimiter);

                // 将 text/ejs-template 内容中的 '<%%%' 替换成 '<%', 后续由 ejs 编译
                let output = replace(temp, '<' + delimiter + delimiter + delimiter, '<' + delimiter);

                template = template.replace(input, output);
            });
        }

        return template;
    };

};

function replace(str, replaceFrom, replaceTo) {
    replaceFrom = new RegExp(replaceFrom, 'gm');

    return str.replace(replaceFrom, replaceTo);
}