
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