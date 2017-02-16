/**
 * 私有模板
<taf>
	<application>
		<server>
			env=NODE_ENV=dev;NODE_SITE=qidian
		</server>
	</application>
</taf>
 */
var config = {
	"local" : {
		"host": process.env.IP || '0.0.0.0',
		"port": process.env.PORT || 10500,
		"stat": process.env.STAT || false,
		"path": "/Users/yuewen-luolei/Yuewen/Tencent/readnovel_proj/.cache/config",
		"static_conf_file": "path",
		"server_conf_file": "server",
		"routermap_file" : "routes"
	},
	"dev" : {
		"host": process.env.IP || '0.0.0.0',
		"port": process.env.PORT || 10500,
		"stat": process.env.STAT || false,
		"path": "/data/website/en.qidian.com/views/node-config",
		"static_conf_file": "path",
		"server_conf_file": "server",
		"routermap_file" : "dynamic_routermap"
	},
	"oa" : {
		"host": process.env.IP || '0.0.0.0',
		"port": process.env.PORT || 10500,
		"stat": process.env.STAT || false,
		"path": "/data/svndata/qd_oversea_webFrontend/oa/views/node-config",
		"static_conf_file": "path",
		"server_conf_file": "server",
		"routermap_file" : "dynamic_routermap"
	},
	"oa2" : {
		"host": process.env.IP || '0.0.0.0',
		"port": process.env.PORT || 10500,
		"stat": process.env.STAT || false,
		"path": "/data/website/en.qidian.com/views/node-config",
		"static_conf_file": "path",
		"server_conf_file": "server",
		"routermap_file" : "dynamic_routermap"
	},
	"pro" : {
		"host": process.env.IP || '0.0.0.0',
		"port": process.env.PORT || 10500,
		"stat": process.env.STAT || false,
		"path": "/data/website/en.qidian.com/views/node-config",
		"static_conf_file": "path",
		"server_conf_file": "server",
		"routermap_file" : "dynamic_routermap"
	}
};

module.exports = config;
