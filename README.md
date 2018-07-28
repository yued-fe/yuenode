[![dependencies Status](https://david-dm.org/yued-fe/yuenode/status.svg)](https://david-dm.org/yued-fe/yuenode) [![devDependencies Status](https://david-dm.org/yued-fe/yuenode/dev-status.svg)](https://david-dm.org/yued-fe/yuenode?type=dev)

# 新版node框架机简介

[TOC]

## 文件目录结构

```js
yuenode
    |
    |-+ bash
    |
    |-+ config          // 配置文件目录
    |
    |-+ lib
    |
    |-+ logs             // 默认日志文件输出目录
    |
    |-+ node_modules
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

1. 执行 (t)npm install
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
      out_file: 'logs/m.qidian.com/out.log',
      error_file: 'logs/m.qidian.com/err.log',
      merge_logs: true,
      // 以下是站点配置
      env: {
        // 服务端口
        IP: '0.0.0.0',
        // 服务端口
        PORT: 10500,
        // 站点配置
        config: JSON.stringify({
          // NODE服务项目别名
          NODE_SITE: 'm',
          // 当前Node服务环境
          ENV_TYPE: NODE_ENV,
          // 是否开启L5 taf平台适用
          l5_on: false,

          // 项目配置文件夹地址
          path: '/Users/shilei/qidian-git/qidian-m/.cache/config',
          // 配置文件名,默认为 server.js
          server_conf_file: 'server',
          // 动态路由映射文件或文件夹名,默认为 routermap，如果是文件夹默认加载文件夹内的index
          routermap_file: 'routes', 
          // extends文件或文件夹名，如果是文件夹默认加载文件夹内的index，没有index的话加载loader
          extends_file: 'extends',
          // 是否开启简繁体转换功能
          character_conversion: true,

          // 是否开启静态化服务
          static_server_on: true,
          // 静态化路由配合文件,默认为 static_routermap
          static_routermap_file: 'static_routermap',
          // 静态化服务原有后端接口，后端post所有页面数据，不使用此静态化接口改为空字符串即可
          static_server_cgi: '/api/v2/setData',
          // 新静态化接口，复用动态路由，使用则注意在动态路由加入static字段，后端post请求动态路由，不需要传body数据，不使用此静态化接口改为空字符串即可
          static_dynamic_router: '/api/setStatic',

          // 显示错误密码，不配置则关闭
          error_show_pwd: false,
          // 接口超时时间
          timeout: 5000,
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
  cookie          // [string] cookie string
  cookieObj       // [Object] cookie obj
  header          // [Object] header

  staticConf      // [Object] 静态配置
  envType         // [String] 当前环境
  extends         // [Object] extends 方法
}

// YUE.location
{
  protocol: 'http:',
  slashes: true,
  auth: null,
  host: 'm.qidian.com:80',
  port: '80',
  hostname: 'localm.qidian.com',
  hash: null,
  search: '?a=1',
  query: { a: '1' },
  pathname: '/fans',
  path: '/fans?a=1',
  href: 'http://m.qidian.com:80/fans?a=1'
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
          MODID: 123,
          CMDID: 321,
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
 * 自定义扩展
 * 可以将一些自定义方法注入到框架机中通过 YUE.extends.{方法名} 直接调用
 */
module.exports = {
  getBookUrl: function(bookId) {
    return '/book/' + bookId + '/catalog';
  }
}
```

## 工作流程

![yuenode](http://oib8kvha0.bkt.clouddn.com/yuenode.jpg)

这里有一个丑萌的图，相信大家看完了应该是不太理解，没关系我们还有文字描述：

### 模板渲染

因为有些项目有多域名的情况，所以首先会将动态路由变为 path.host.config 的形式，可以支持多域名的情况。收到客户端请求后根据 path 去寻找相应的域名下的路由配置，取得 views 模板，向后端发送 cgi 取得数据，cgi 返回不为 200/301/302，则发生对应错误。返回 200 但 code 不为 0 则发生 400 错误。

向后端发送 cgi 请求前如果开启 L5 且正确配置，会从 L5 取得相应后端 ip，否则采用项目配置文件中的 cgi.ip。cgi.domain 为后端请求 headers 中的 host 字段，配置错误有可能造成后端拒绝请求。

在模板渲染时跳过 <script type="text/ejs-template"></script> 标签中的相关模板，返回客户端供客户端使用；如果开启了简繁体转换，则会根据 cookie 中的 lang 字段判断简繁体，如果 lang 为 zht，则会将内容转换为繁体输出到客户端；如果配置了 extends 则添加到模板渲染中。

![框架机的模板渲染逻辑](http://oib8kvha0.bkt.clouddn.com/yue-node-dynamic.png)

### 错误处理

发生错误时，如果模板文件根目录中存在有 error/{状态码}.html（如 error 文件夹下 404.html），则渲染对应状态码的页面，否则会渲染普通 error 页面。

寻找顺序为：模板文件根目录中对应域名文件夹下 error/{状态码}.html 页面 => 模板文件根目录 error/{状态码}.html 页面 => 模板文件根目录中对应域名文件夹下 error.html 页面 => 模板文件根目录 error.html 页面 => 框架机自带 error.html 页面。顺序寻找，找到即渲染。

为兼容已有项目，请注意 error.html 页面与 error 文件夹为平级。以上为强约定，不需要配置。

pro 环境添加你配置的 error_show_pwd 到 query 可以显示错误信息。

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

静态化一律由后端 post 请求进行发起，旧有接口需要将页面所需 data 全部 post 过来，新接口则可以复用模板渲染的路由，可以直接 post 请求模板渲染的路由 path (例如 '/api/setStatic/m.qidian.com/male')，只要在模板渲染的路由中配置好相应的 static 字段即可。

收到后端请求后，取得对应 path 的路由配置，取得 views 模板，从请求 body 中（新接口则向后端发送请求）获得数据，渲染完成后保存在 static 配置的文件路径中。

![框架机的静态化逻辑](http://oib8kvha0.bkt.clouddn.com/yue-node-static-2.png)

如果生成静态文件成功，后端则后收到 statusCode 为 200、body.code 为 0 的回应。否则 body.msg 为相应的原因。 

### 关于请求

我们强烈建议客户端访问 host（包括涉及 nginx 转换的 host）、前端 routerMap 中的 host、后端接口 host（cgi.domain）以及其他可能涉及 host 的任何环节**能够将 host 保持一致**，这样的好处是不言而喻的。但假如实在有不可抗力导致 host 在某一环节产生了变换，框架机提供了以下方案进行容错（但不建议依赖这些方案）：

1. 如果请求 host 在 nginx 中做过变换（例如将 www.webnovel.com 转换成 en.qidian.com），可以在 nginx 转换时将客户端的真实 host 加入到请求 header 中的 x-host，这样全局变量 YUE.location 中所有 host 将为 x-host 中的 host。
2. 如果客户端 host 与后端请求 host 不一致，后端服务可以在 框架机请求 header 中的 x-host 与 x-url 中取到框架机接收到的相应 host（这一步已经包括对 nginx 中 x-host 的获取） 与 url。

