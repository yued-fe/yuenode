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
		"port": process.env.PORT || 10007,
		"stat": process.env.STAT || false,
		"path": "/data/website/m.readnovel.com/config",
		"static_conf_file": "path",
		"server_conf_file": "server",
		"routermap_file" : "routes/index"
	},
	"oa" : {
		"host": process.env.IP || '0.0.0.0',
		"port": process.env.PORT || 10020,
		"stat": process.env.STAT || false,
		"path": "/data/website/m.readnovel.com/config",
		"static_conf_file": "path",
		"server_conf_file": "server",
		"routermap_file" : "routes/index"
	},
	"pre" : {
		"host": process.env.IP || '0.0.0.0',
		"port": process.env.PORT || 10020,
		"stat": process.env.STAT || false,
		"path": "/data/website/m.readnovel.com/config",
		"static_conf_file": "path",
		"server_conf_file": "server",
		"routermap_file" : "routes/index"
	},
	"pro" : {
		"host": process.env.IP || '0.0.0.0',
		"port": process.env.PORT || 10020,
		"stat": process.env.STAT || false,
		"path": "/data/website/m.readnovel.com/config",
		"static_conf_file": "path",
		"server_conf_file": "server",
		"routermap_file" : "routes/index"
	}
};

module.exports = config;