[![dependencies Status](https://david-dm.org/yued-fe/yuenode/status.svg)](https://david-dm.org/yued-fe/yuenode) [![devDependencies Status](https://david-dm.org/yued-fe/yuenode/dev-status.svg)](https://david-dm.org/yued-fe/yuenode?type=dev)

# 新版node框架机简介

[TOC]

## 文件目录结构
```js
yuenode
    |
    |-+ config          // 配置文件目录
    |
    |-+ handler
    |
    |-+ lib
    |
    |-+ logs             // 默认日志文件输出目录
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
    |- package.json
    |
    |- README.md

```

## 使用方法

1. 执行 npm install
2. 如果需要线上运行，则先要执行 sudo npm install pm2 -g
3. 配置 config/*.config.js 中的环境变量、功能开关，可以自己复制多份不同的配置文件，每次根据文件启动不同的服务
4. 本地调试用 gulp 启动，线上用 pm2 启动，如果增加配置需要在 npm scripts 中配置好，需要注意站点配置文件 name、NODE_SITE 以及 npm script 中的命令站点名需要一致。

        以 m 站为例：
        执行 'npm run dev:m' 为 gulp 开启 m 站本地调试
        执行 'npm run start:m' 为 pm2 开启 m 站线上运行启动
        执行 'npm run reload:m' 为 pm2 重载 m 站
        执行 'npm run stop:m' 为 pm2 停止 m 站
        执行 'npm run delete:m' 为 pm2 删除 m 站进程

5. 注意 NODE_ENV 变量，需要启动时输入或者手动修改配置文件
6. 运行环境需要 node 版本 >= 6

## 配置文件
```js
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
      log_file: 'log/m.qidian.com/combined.log',
      out_file: 'log/m.qidian.com/out.log',
      error_file: 'log/m.qidian.com/err.log',
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
```

## 可以在模板直接使用的全局变量：YUE

```js
// YUE
{
  ua              // [String] user-agent
  location        // [Object] location obj
  cookie          // [Object] cookie obj

  pageUpdateTime  // [String] 时间
  staticConf      // [Object] 静态配置
  envType         // [String] 当前环境
                  // extends（如果开启）
}

// YUE.location
{
  protocol: 'http:',
  slashes: true,
  auth: null,
  host: 'localm.qidian.com:10500',
  port: '10500',
  hostname: 'localm.qidian.com',
  hash: null,
  search: '?a=1',
  query: { a: '1' },
  pathname: '/fans',
  path: '/fans?a=1',
  href: 'http://localm.qidian.com:10500/fans?a=1'
}
```

## 以往约定格式

```js
/**
 * 项目配置文件
 * 获取你的项目相关配置
 */
module.exports.genConf = { 
  local: {
    // 模板文件根目录
    views: {
      path: path.join(__dirname, '../views'),
    },
    // 静态化文件生成根目录
    index: '/data/website/static',
    // 传入模板渲染的参数，比如静态文件路径，可以任意设置，在模板中通过 YUE.staticConf 取得
    static: {
      domains: {
        m: 'oam.qidian.com',
        apps: 'oaapps.qidian.com',
        static: 'oaqidian.gtimg.com'
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

/**
 * 模板渲染路由配置形式
 * views 和 cgi 是必需的，views 为静态模板位置，cgi 为后端接口
 * static 非必需，为静态化资源生成后存放位置，如果配置了static，则可以通过后端post路由path进行静态化
 */
module.exports = {
  'm.qidian.com/category': {
    views: '/m.qidian.com/category/index',
    cgi: '/mpage/category/index?gender=male',
    static: '/m.qidian.com/demo.html'
  }
}

/**
 * 静态化路由配置形式
 * views 和 static 是必需的，views 为静态模板位置，static 为静态化资源生成后存放位置
 * 主要兼容过去的静态化接口形式，以下为原有 static 书写规则：
 * 若为子频道页面,统一使用 channel/index.html 方式
 * 若为具体的单独页面,则使用 channel/name.html 方式
 */
module.exports = {
  '/m.qidian.com/male': {
    views: '/m.qidian.com/homepage/male.html',
    static: '/m.qidian.com/male/index.html'
  }
}

/**
 * 非0自定义handler
 * 与后端约定数据格式为{code: 0, msg: '', data: {}}
 * code 为 0 则表示成功，不为 0 则 msg 为失败消息，data 为 实际数据
 * 如果 code 不为 0，则各项目可以根据自己的约定对非 0 的情况做一些处理，即为非0自定义handler
 * 此函数将会在后端返回code不为0时调用，可以做一些自定义逻辑，没有的话会由框架机默认渲染error页面，除非开启强制渲染
 */
module.exports = function (ctx, body, requestUrl) {
  switch (body.code) {
    case 1:
      throw new Error('找不到数据 后台服务端拉取数据失败')
      break;
    case 1006:
      body.defaultSearch = {};
      body.msg = body.msg + '\n' + body.exception;
      ctx.status = 302;
      ctx.redirct('/error');
      break;
  }
}

/**
 * 自定义扩展
 * 可以将一些自定义方法注入到框架机中通过 YUE.{方法名} 直接调用
 */
module.exports = {
  getBookUrl: function(bookId) {
    return '/book/' + bookId + '/catalog';
  }
}
```

## 工作流程

### 模板渲染

因为有些项目有多域名的情况，所以首先会将动态路由变为 path.host.config 的形式，可以支持多域名的情况。收到客户端请求后根据 path 去寻找相应的域名下的路由配置，取得 views 模板，向后端发送 cgi 取得数据，cgi 返回不为200/301/302，则发生错误。返回 200 但 code 不为 0 则发生错误，有非 0 自定义 handler 则执行。在此过程中如果开启了 taf 上报，则会进行上报。
向后端发送 cgi 请求前如果开启 L5 且正确配置，会从 L5 取得相应后端 ip，否则采用项目配置文件中的 cgi.ip。cgi.domain 为后端请求 headers 中的 host 字段，配置错误有可能造成后端拒绝请求。如果后端采用 https 协议，请在框架机中开启。
如果开启了 inline-ejs 功能，则会在模板渲染时跳过 inline-ejs 标签中的相关模板，返回客户端供客户端使用；如果开启了简繁体转换，则会根据 cookie 中的 lang 字段判断简繁体，如果 lang 为 zht，则会将内容转换为繁体输出到客户端；如果配置了 extends 则添加到模板渲染中。

### 错误处理

发生错误时，如果模板文件根目录中存在有 error/{状态码}.html（如 error 文件夹下 404.html），则渲染对应状态码的页面，否则会渲染普通 error 页面。
寻找顺序为：模板文件根目录中对应域名文件夹下 error/{状态码}.html 页面 => 模板文件根目录 error/{状态码}.html 页面 => 模板文件根目录中对应域名文件夹下 error.html 页面 => 模板文件根目录 error.html 页面 => 框架机自带 error.html 页面。顺序寻找，找到即渲染。
为兼容已有项目，请注意 error.html 页面与 error 文件夹为平级。以上为强约定，不需要配置。

```js
/**
 * 完整顺序示例目录结构
 */
views
    |
    |-+ m.qidian.com
    |    |
    |    |-+ error
    |    |    |
    |    |    |- 404.html   // ① 模板文件根目录中对应域名文件夹下 error/{状态码}.html 页面
    |    |
    |    |- error.html      // ③ 模板文件根目录中对应域名文件夹下 error.html 页面
    |
    |-+ error
    |    |
    |    |- 404.html        // ② 模板文件根目录 error/{状态码}.html 页面
    |
    |- error.html           // ④ 模板文件根目录 error.html 页面

                            // ⑤ 框架机自带 error 页

/**
 * error 页面渲染变量
 */
{
  code                      // [String] statusCode
  envType                   // [String] 当前环境
  staticConf                // [Object] 静态配置
  msg                       // [String] 错误描述信息
  stack                     // [String] 错误堆栈信息
}
```

### 静态化服务

静态化一律由后端 post 请求进行发起，旧有接口需要将页面所需 data 全部 post 过来，新接口则可以复用模板渲染的路由，可以直接 post 请求模板渲染的路由 path，只要在模板渲染的路由中配置好相应的 static 字段即可。
收到后端请求后，取得对应 path 的路由配置，取得 views 模板，从请求 body 中（新接口则向后端发送请求）获得数据，渲染完成后保存在 static 配置的文件路径中，如开启压缩则压缩。
如果生成静态文件成功，后端则后收到 statusCode 为 200、body.code 为 0 的回应。否则 body.msg 为相应的原因。 

## 原有项目迁移

1. 要将配置文件修改为现有形式，具体可关注 **配置文件** 一节
2. 以往模板渲染的一些变量如 pageUpdateTime, CLIENT_URL, cookie等现在已经整合到全局变量 YUE 中，具体可关注 **可以在模板直接使用的全局变量：YUE** 一节
