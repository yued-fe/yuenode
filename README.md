

A Nodejs framework for Yuewen Group's project. 基于koa,适用于阅文web项目的 Nodejs 前后端分离框架。

* 维护:[@罗磊](luolei@yuewen.com)

#### 时间点

* 2017.03.10 修正EJS的替换时序
* 2017.02.27 增加路由rewrite支持
* 2017.02.15 抛弃配置文件的形式,采用环境变量配置参数
* 2017.02.08:抽离配置,创建项目

#####本地调试

1. 安装依赖`npm install`
2. 配置`local.config.js` : 参考下方PM2启动示例说明
2. 执行`gulp`


######PM2 启动示例

全局安装pm2: `npm install pm2 -g` ;

通过`pm2`命令启动配置脚本`pm2 start {server}.config.js` ;


```
module.exports = {
  /**
   * 本地服务环境配置
   */
  apps: [
    // First application
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
        cgi_ssl_on:false, // 后端是否采用https协议,内网服务默认关闭
        path: "/Users/yuewen-luolei/Yuewen/Tencent/qidian-m/.cache/config",
        server_conf_file: "server", // 配置文件名,默认为 server.js
        routermap_file: "routes", // 动态路由映射文件名,默认为 dynamic_routermap
        static_server_on:false, // 静态化服务开启开关,默认关闭
        static_routermap_file: "static_routermap",//静态化路由配合文件,默认为 static_routermap
        log_level:"info", // 日志级别
        custom_handle_on:true, // 是否开启非0自定义handler,
        custom_handle_file:"oversea", // 自定义handler路径,建议命名与项目别名统一
      }
    }
  ]
}

```






