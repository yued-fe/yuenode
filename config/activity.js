/**
 * 私有模板
<taf>
	<application>
		<server>
			env=NODE_ENV=dev;NODE_SITE=activity
		</server>
	</application>
</taf>
 */
var config = {
	"dev" : {
		"host": process.env.IP || '0.0.0.0',
		"port": process.env.PORT || 11001,
		"stat": process.env.STAT || false,
		"path": "/data/website/activity.qidian.com/views/node-config",
		"static_conf_file": "path",
		"server_conf_file": "server",
		"routermap_file" : "dynamic_routermap",
		"static_routermap_file":"static_routermap"
	},
	"oa" : {
		"host": process.env.IP || '0.0.0.0',
		"port": process.env.PORT || 11001,
		"stat": process.env.STAT || false,
		"path": "/data/website/activity.qidian.com/views/node-config",
		"static_conf_file": "path",
		"server_conf_file": "server",
		"routermap_file" : "dynamic_routermap",
		"static_routermap_file":"static_routermap"
	},
	"pre" : {
		"host": process.env.IP || '0.0.0.0',
		"port": process.env.PORT || 11001,
		"stat": process.env.STAT || false,
		"path": "/data/website/activity.qidian.com/views/node-config",
		"static_conf_file": "path",
		"server_conf_file": "server",
		"routermap_file" : "dynamic_routermap",
		"static_routermap_file":"static_routermap"
	},
	"pro" : {
		"host": process.env.IP || '0.0.0.0',
		"port": process.env.PORT || 11001,
		"stat": process.env.STAT || false,
		"path": "/data/website/activity.qidian.com/views/node-config",
		"static_conf_file": "path",
		"server_conf_file": "server",
		"routermap_file" : "dynamic_routermap",
		"static_routermap_file":"static_routermap"
	}
};

module.exports = config;