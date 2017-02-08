/**
 * 私有模板
<taf>
	<application>
		<server>
			env=NODE_ENV=dev;NODE_SITE=qq
		</server>
	</application>
</taf>
 */
var config = {
	"dev" : {
		"host": process.env.IP || '0.0.0.0',
		"port": process.env.PORT || 11002,
		"stat": process.env.STAT || false,
		"path": "/data/website/activity.book.qq.com/views/node-config",
		"static_conf_file": "path",
		"server_conf_file": "server",
		"routermap_file" : "dynamic_routermap"
	},
	"oa" : {
		"host": process.env.IP || '0.0.0.0',
		"port": process.env.PORT || 11002,
		"stat": process.env.STAT || false,
		"path": "/data/website/activity.book.qq.com/views/node-config",
		"static_conf_file": "path",
		"server_conf_file": "server",
		"routermap_file" : "dynamic_routermap"
	},
	"pro" : {
		"host": process.env.IP || '0.0.0.0',
		"port": process.env.PORT || 11002,
		"stat": process.env.STAT || false,
		"path": "/data/website/activity.book.qq.com/views/node-config",
		"static_conf_file": "path",
		"server_conf_file": "server",
		"routermap_file" : "dynamic_routermap"
	}
};

module.exports = config;