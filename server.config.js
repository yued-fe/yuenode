
var NODE_ENV = process.env.NODE_ENV || 'pro';

module.exports = {
  /**
   * 本地服务环境配置
   */
  apps: [
    // First application
    {
      name: "oversea",
      script: "app.js",
      env: {
        COMMON_VARIABLE: "true",
        NODE_SITE:"oversea", // NODE服务项目别名
        NODE_ENV: NODE_ENV, // 当前Node服务环境
        port: 10500, // 服务端口
        stat: false, // 是否开启taf上报,默认关闭
        l5_on:false, // 是否开启L5 taf平台适用
        cgi_ssl_on:false, // 后端是否采用https协议,内网服务默认关闭
        path: "/data/svndata/qd_oversea_webFrontend/oa/views/node-config",
        server_conf_file: "server", // 配置文件名,默认为 server.js
        routermap_file: "dynamic_routermap", // 动态路由映射文件名,默认为 dynamic_routermap
        static_server_on:false, // 静态化服务开启开关,默认关闭
        static_routermap_file: "static_routermap",//静态化路由配合文件,默认为 static_routermap
        log_level:"info", // 日志级别
        custom_handle_on:false, // 是否开启非0自定义handler,
        custom_handle_file:"oversea", // 自定义handler路径,建议命名与项目别名统一
      }
    }
  ]
}