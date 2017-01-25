// tooling
const fs       = require('../fs');
const require2 = require('../require');
const postcss  = require('postcss');

module.exports = ({ from, to, map = false, plugins = [], syntax }, config = {}) => {
	const absoluteFrom = fs.join(config.from, from);
	const absoluteTo   = fs.join(config.from, to);
	const absoluteMap  = typeof map === 'string' ? fs.join(config.from, map) : map;

	return fs.readFile(absoluteFrom, 'utf8').then(
		// promise processed source
		(contents) => postcss(
			plugins.map(
				(plugin) => typeof plugin === 'string'
				? require2(
					plugin,
					{
						basedir: config.from
					}
				)()
				: Array.isArray(plugin)
					? require2(
						plugin[0],
						{
							basedir: config.from
						}
					)(plugin[1])
					: plugin
			)
		).process(
			contents,
			// processor options
			Object.assign(
				{
					from: absoluteFrom,
					to:   absoluteTo,
					map:  typeof map === 'string' ? {
						inline: false
					} : Boolean(map)
				},
				syntax ? {
					syntax: syntax
				} : {}
			)
		)
	).then(
		// promise written compiled files
		(result) => (
			typeof map === 'string'
			? Promise.all([
				fs.writeFile(absoluteTo,  String(result.css)),
				fs.writeFile(absoluteMap, String(result.map))
			])
			: fs.writeFile(absoluteTo, String(result.css))
		).then(
			// promise contents
			() => String(result.css)
		)
	);
};
