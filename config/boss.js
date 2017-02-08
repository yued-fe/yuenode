/**
 * 私有模板
<taf>
	<application>
		<server>
			env=NODE_ENV=dev;NODE_SITE=boss
		</server>
	</application>
</taf>
 */
var config = {
	"local" : {
		"path": "../../QidianBoss/src/config/",
		"host": process.env.IP || '0.0.0.0',
		"port": process.env.PORT || 80,
		"debug": process.env.DEBUG || true,
		"stat": process.env.STAT || false,	//监控
		"routermap_file" : "routes"
	},
	"dev" : {
		"host": process.env.IP || '0.0.0.0',
		"port": process.env.PORT || 10301,
		"stat": process.env.STAT || false,
		"path": "/data/website/boss.qidian.com/config",
		"static_conf_file": "path",
		"server_conf_file": "server",
		"routermap_file" : "routes"
	},
	"oa" : {
		"host": process.env.IP || '0.0.0.0',
		"port": process.env.PORT || 10301,
		"stat": process.env.STAT || false,
		"path": "/data/website/boss.qidian.com/config",
		"static_conf_file": "path",
		"server_conf_file": "server",
		"routermap_file" : "routes"
	},
	"pro" : {
		"host": process.env.IP || '0.0.0.0',
		"port": process.env.PORT || 10301,
		"stat": process.env.STAT || false,
		"path": "/data/website/boss.qidian.com/config",
		"static_conf_file": "path",
		"server_conf_file": "server",
		"routermap_file" : "routes"
	}
};

module.exports = config;