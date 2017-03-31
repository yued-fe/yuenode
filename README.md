# 新node版框架机简介

## 文件目录结构
```js
yuenode
    |
    |-+ handler 
    |
    |-+ lib
    |
    |-+ log
    |
    |-+ middleware
    |
    |-+ node_modules
    |
    |-+ router
    |
    |-+ views
    |
    |- app.js
    |
    |- gulpfile.js
    |
    |- local.config.js
    |
    |- package.json
    |
    |- README.md
    |
    |-siteConfig.js

```

## 使用方法

1. 执行 npm install
2. 配置 local.config.js 中的环境变量，可以自己复制多份不同的环境变量文件
3. 配置 siteConfig 中的各种文件位置、服务开关，可以自己复制多份不同的站点配置，如果文件名有修改就要在第2步配好此文件入口
4. 用 pm2 或者 gulp 启动，如果第2步文件名有修改则需要在 gulpfile.js 中更改入口文件

```js
// local.config.js

const NODE_ENV = process.env.NODE_ENV || 'local';

const path = require('path');

module.exports = {
  /**
   * 服务环境配置
   */
  apps: [
    {
      name: 'yuenode',
      script: 'app.js',
      node_args: '--harmony',
      log_file: 'log/combined.log',
      out_file: 'log/out.log',
      error_file: 'log/err.log',
      merge_logs: true,
      log_date_format : 'YYYY-MM-DD HH:mm:ss',
      env: {
        NODE_SITE: 'm', // NODE服务项目别名
        NODE_ENV: NODE_ENV, // 当前Node服务环境
        port: 10500, // 服务端口
        CONFIG_FILE: 'off', // 设置为 on 时,兼容旧有配置文件形式
        config: path.resolve(__dirname, './siteConfig.js') // 站点配置文件入口
      }
    }
  ]
};
```

```js
// siteConfig.js

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
    // extends文件或文件夹名，如果是文件夹默认加载文件夹内的index，没有index的话加载loader
    extends_file: 'extends',
    // 是否开启静态化服务
    static_server_on: true,
    // 静态化路由配合文件,默认为 static_routermap
    static_routermap_file: 'static_routermap',
    // 静态化服务后端接口，默认 /api/v2/setData
    static_server_cgi: '/api/v2/setData',
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
```

## 可以在模板直接使用的全局变量

```js
CLIENT_URL      // [String] url
cookie          // [String] cookie
CLIENT_COOKIE   // [String] cookie
CLIENT_UA       // [String] ua
LOCATION        // [Object] location obj
COOKIEOBJ       // [Object] cookie obj
QUERYOBJ        // [Object] query obj

staticConf      // [Object] 静态配置
envType         // [String] 当前环境
isZht           // [Boolean] 是否为繁体（如果开启）
[Function]      // [Functions] extendsLoader（如果开启）
```

## 以往约定格式

```js
// 项目配置文件
module.exports.genConf = { 
    local: {
        // 模板文件根目录
        views: {
            path: path.join(__dirname, '../views'),
        },
        // 静态化文件生成根目录
        index: '/data/website/static',
        // 传入模板渲染的参数，比如静态文件路径
        static: {
            domains: {
                m: 'oam.qidian.com',
                apps: 'oaapps.qidian.com',
                static: 'oaqidian.gtimg.com',
                cover: 'qidian.qpic.cn',
                pay: 'oapay.yuewen.com', // 充值域名
                security: 'aq.yuewen.com', // 安全中心域名
                pc: 'oawww.qidian.com', // PC站点域名
                hiijack: 'oabook.qidian.com', // 反劫持上报域名
                activity: 'oaactivity.qidian.com', // 活动域名
            }
        },
        // 后端请求接口配置，如后端ip，l5
        cgi: {
            ip: 'devm.qidian.com',
            domain: 'devm.qidian.com',
            L5: {
                enable: false,
                conf: {
                    MODID: 64138113,
                    CMDID: 851968,
                }
            }
        }
    }
}

// 模板渲染路由
module.exports = {
    'm.qidian.com/category': {
        views: '/m.qidian.com/category/index',
        cgi: '/mpage/category/index?gender=male'
    }
}

// 静态化路由
module.exports = {
    '/test': {
        'views': '/m.qidian.com/category/detail.html',
        'static': '/m.qidian.com/demo.html'
    }
}

// 非0自定义handler
module.exports = function (ctx, body, requestUrl) {
    switch (body.code) {
        case 1:
            throw new Error('找不到数据 后台服务端拉取数据失败')
            break;
        case 1006:
            body.defaultSearch = {};
            body.msg = body.msg + "\n" + body.exception;
            ctx.status = 302;
            ctx.redirct('/error');
            break;
    }
}

// 自定义扩展
module.exports = {
    getBookUrl: function(bookId) {
        return '/book/' + bookId + '/catalog';
    }
}
```