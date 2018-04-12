module.exports = {
  /**
   * 服务环境配置
   */
  apps: [
    {
      // 服务别名
      name: 'overseam',
      script: 'app.js',
      node_args: '--harmony',
      instances: 0,
      exec_mode: 'cluster',
      // 以下是日志输出选项
      out_file: '/data/logs/m.webnovel.com/out.log',
      error_file: '/data/logs/m.webnovel.com/err.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      // 以下是站点配置
      env: {
        // 服务IP
        IP: '0.0.0.0',
        // 服务端口
        PORT: 10501,
        // 站点配置
        config: JSON.stringify({
          // NODE服务项目别名
          NODE_SITE: 'overseam',
          // 当前Node服务环境
          ENV_TYPE: 'oa',
          // 是否开启L5 taf平台适用
          l5_on: false,

          // 项目配置文件夹地址
          path: '/data/website/m.webnovel.com/views/node-config',
          // 配置文件名,默认为 server.js
          server_conf_file: 'server',
          // 动态路由映射文件或文件夹名,默认为 routermap，如果是文件夹默认加载文件夹内的index
          routermap_file: 'dynamic_routermap',
          // extends文件或文件夹名，如果是文件夹默认加载文件夹内的index，没有index的话加载loader
          extends_file: 'extends',
          // 是否开启简繁体转换功能
          character_conversion: false,

          // 是否开启静态化服务
          static_server_on: false,
          // 静态化路由配合文件,默认为 static_routermap
          static_routermap_file: 'static_routermap',
          // 静态化服务原有后端接口，后端post所有页面数据，不使用此静态化接口改为空字符串即可
          static_server_cgi: '/api/v2/setData',
          // 新静态化接口，复用动态路由，使用则注意在动态路由加入static字段，后端post请求动态路由，不需要传body数据，不使用此静态化接口改为空字符串即可
          static_dynamic_router: '/api/setStatic',

          // pro 显示错误密码，不配置则关闭，配置则要配置字符串，具体见readme
          error_show_pwd: false,
        })
      }
    }
  ]
};
