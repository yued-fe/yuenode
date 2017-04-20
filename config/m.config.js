const NODE_ENV = process.env.NODE_ENV || 'local';

module.exports = {
  /**
   * 服务环境配置
   */
  apps: [
    {
      // 服务别名
      name: 'm',
      script: 'app.js',
      node_args: '--harmony',
      instances: 0,
      exec_mode: 'cluster',
      // 以下是日志输出选项
      log_file: 'logs/m.qidian.com/combined.log',
      out_file: 'logs/m.qidian.com/out.log',
      error_file: 'logs/m.qidian.com/err.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      // 以下是站点配置
      env: {
        NODE_SITE: 'm', // NODE服务项目别名
        NODE_ENV: NODE_ENV, // 当前Node服务环境
        port: 10500, // 服务端口
        CONFIG_FILE: 'off', // 设置为 on 时,兼容旧有配置文件形式
        // 站点配置
        config: JSON.stringify({
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
          // extends文件或文件夹名，如果是文件夹默认加载文件夹内的index，没有index的话加载loader
          extends_file: 'extends',
          // 是否开启非0自定义handler
          custom_handle_on: true,
          // 非0自定义handler文件路径
          custom_handle_file: '',

          // 动态路由映射文件或文件夹名,默认为 routermap，如果是文件夹默认加载文件夹内的index
          routermap_file: 'routes', 
          // 是否开启 inline-ejs,提供忽略 <script type="text/ejs-template"></script> 功能
          inline_ejs: true,
          // 开启 inline-ejs后，可自定义 script 标签的 type 属性，默认为 text/ejs-template
          inline_ejs_type: 'text/ejs-template',
          // 是否开启简繁体转换功能
          character_conversion: true,
          // 是否开启非0强制渲染页面，主要针对静态化页面本地渲染，比如后端返回没有code、msg，只有data的情况。
          force_render: false, 

          // 是否开启静态化服务
          static_server_on: true,
          // 静态化路由配合文件,默认为 static_routermap
          static_routermap_file: 'static_routermap',
          // 是否开启静态化 html 压缩
          compressHTML: true,
          // 静态化服务原有后端接口，后端post所有页面数据，不使用此静态化接口改为空字符串即可
          static_server_cgi: '/api/v2/setData',
          // 新静态化接口，复用动态路由，使用则注意在动态路由加入static字段，后端post请求动态路由，不需要传body数据，不使用此静态化接口改为空字符串即可
          static_dynamic_router: '/api/setStatic',
        })
      }
    }
  ]
};