

A Nodejs framework for Yuewen Group's project. 基于koa,适用于阅文web项目的 Nodejs 前后端分离框架。

* 维护:[@罗磊](luolei@yuewen.com)

####说明

####Start

####时间点

* 2017.02.15 抛弃配置文件的形式,采用环境变量配置参数
* 2017.02.08:抽离配置,创建项目


####配置示例


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
   * 一个服务示例
   */
  apps: [

    // First application
    {
      name: "yuenode",
      script: "app.js",
      env: {
        COMMON_VARIABLE: "true",
        NODE_SITE:"oversea", // NODE服务项目别名
        NODE_ENV: "local", // 服务系统环境变量
        CONFIG_FILE:"off", // 是否兼容旧有读取配置文件形式,默认关闭
        port: 11001, // 服务端口
        stat: false, // 是否开启上报
        l5_on:false, // 是否开启L5 taf平台适用
       	path: "/data/website/en.qidian.com/views/node-config", // Node服务配置目录
        static_conf_file: "path", //
        server_conf_file: "server", // 业务相关配置文件名
        routermap_file: "dynamic_routermap", // 路由映射表文件名
        static_server_on:true // 静态化服务功能开关
        static_routermap_file: "static_routermap", // 静态化服务路由映射表
      }
    }
  ]
}

```






