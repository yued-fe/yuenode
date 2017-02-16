module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   * PM2启动服务配置
   */
  apps: [

    // 海外版示例pm2配置
    {
      name: "yuenode",
      script: "app.js",
      env: {
        COMMON_VARIABLE: "true",
        NODE_SITE:"oversea", // NODE服务项目别名
        NODE_ENV: "local", // 当前Node服务环境
        port: 10500, // 服务端口
        stat: false, // 是否开启taf上报,默认关闭
        l5_on:false, // 是否开启L5 taf平台适用
        path: "/data/website/en.qidian.com/views/node-config", // Node服务配置目录
        server_conf_file: "server", // 配置文件名,默认为 server.js
        routermap_file: "dynamic_routermap", // 动态路由映射文件名,默认为 dynamic_routermap
        static_server_on:false, // 静态化服务开启开关,默认关闭
        static_routermap_file: "static_routermap",//静态化路由配合文件,默认为 static_routermap
      }
    }
  ]
}
