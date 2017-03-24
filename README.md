# yuenode-v2
A Nodejs framework for Yuewen Group's project

## 使用方法

1. 执行 npm install
2. 配置 local.config.js 中的环境变量，可以自己复制多份不同的环境变量文件
3. 配置 siteConfig 中的各种文件位置、服务开关，可以自己复制多份不同的站点配置，如果文件名有修改就要在第2步配好此文件入口
4. 用 pm2 或者 gulp 启动，如果第2步文件名有修改则需要在 gulpfile.js 中更改入口文件

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