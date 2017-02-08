/**
 * M站私有模板
<taf>
	<application>
		<server>
			env=NODE_ENV=dev;NODE_SITE=m
		</server>
	</application>
</taf>
 */
var config = {
	"local" : {
		"path": "../../QidianMobile/src/config/",
		"host": process.env.IP || '0.0.0.0',
		"port": process.env.PORT || 10304,
		"debug": process.env.DEBUG || true,
		"stat": process.env.STAT || false,	//监控
		"routermap_file" : "routes",
		"static_routermap_file":"static_routermap"
	},
	"dev" : {
		"host": process.env.IP || '0.0.0.0',
		"port": process.env.PORT || 10304,
		"stat": process.env.STAT || false,
		"path": "/data/website/m.qidian.com/config",
		"static_conf_file": "path",
		"server_conf_file": "server",
		"routermap_file" : "routes",
		"static_routermap_file":"static_routermap"
	},
	"oa" : {
		"host": process.env.IP || '0.0.0.0',
		"port": process.env.PORT || 10304,
		"stat": process.env.STAT || false,
		"path": "/data/website/m.qidian.com/config",
		"static_conf_file": "path",
		"server_conf_file": "server",
		"routermap_file" : "routes",
		"static_routermap_file":"static_routermap"
	},
	"pre" : {
		"host": process.env.IP || '0.0.0.0',
		"port": process.env.PORT || 10304,
		"stat": process.env.STAT || false,
		"path": "/data/website/m.qidian.com/config",
		"static_conf_file": "path",
		"server_conf_file": "server",
		"routermap_file" : "routes",
		"static_routermap_file":"static_routermap"
	},
	"pro" : {
		"host": process.env.IP || '0.0.0.0',
		"port": process.env.PORT || 10304,
		"stat": process.env.STAT || false,
		"path": "/data/website/m.qidian.com/config",
		"static_conf_file": "path",
		"server_conf_file": "server",
		"routermap_file" : "routes",
		"static_routermap_file":"static_routermap"
	}
};

module.exports = config;