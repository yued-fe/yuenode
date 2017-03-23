/**
 * 当前业务站点配置
 */

module.exports = {
    // 是否开启taf上报
    stat: false,
    // 是否开启L5 taf平台适用
    l5_on: false, 
    // 后端是否采用https协议
    cgi_ssl_on: false,
    // 项目配置文件夹地址
    path: '/Users/shilei/qidian-m/.cache/config',
    // 配置文件名,默认为 server.js
    server_conf_file: 'server', 
    // 动态路由映射文件或文件夹名,默认为 routermap，如果是文件夹默认加载文件夹内的index
    routermap_file: 'routes', 
    // extends文件或文件夹名，如果是文件夹默认加载文件夹内的index，没有的话加载loader
    extends_file: 'extends',
    // 是否开启静态化服务
    static_server_on: true,
    // 静态化路由配合文件,默认为 static_routermap
    static_routermap_file: 'static_routermap',
    // 静态化服务后端接口，默认 /api/v2/setData
    static_server_cgi: '/api/v2/setData',
    // 日志级别
    log_level: 'info',
    // 是否开启非0自定义handler
    custom_handle_on: true, 
    // 非0自定义handler文件路径
    custom_handle_file: '',
    // 是否开启非0继续渲染页面，主要针对静态化页面本地渲染，pageUpdateTime 上会加入 sync 标志
    force_render: false,

    // 是否开启简繁体转换功能
    character_conversion: true,
    // 是否开启 inline-ejs,提供忽略 <script type="text/ejs-template"></script> 功能
    inline_ejs: true,
    // 开启 inline-ejs后，可自定义 script 标签的 type 属性，默认为 text/ejs-template
    inline_ejs_type: 'text/ejs-template',
    // 是否开启静态化文件压缩
    minify_static_file: true,
    // 静态化文件压缩选项，可以根据html-minifier配置自由搭配
    minify_config: {
        collapseWhitespace: true,    //删除空格
        collapseInlineTagWhitespace: true    //删除行内属性空格
    },
    // 是否开启错误重定向，开启则如果发生错误定向到统一错误路径，关闭会渲染模板目录下的error.html
    error_redirct: false,
    // 如果开启错误重定向，则定向到此路径
    error_redirct_path: ''
};