/**
 * 所有站点的site配置
 */

var config = {
	"local" : {
		"path": "/Users/yuewen-luolei/Yuewen/Tencent/readnovel_proj/.cache/config",
		"host": process.env.IP || '0.0.0.0',
		"port": process.env.PORT || 10301,
		"debug": process.env.DEBUG || true,
		"stat": process.env.STAT || false,	//监控
		"routermap_file" : "routes",
		"static_routermap_file":"static_routermap"
	}
};

module.exports = config;