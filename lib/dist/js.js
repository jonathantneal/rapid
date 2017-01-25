// tooling
const fs       = require('../fs');
const rollup   = require('rollup');
const require2 = require('../require');

// cache
let cache;

module.exports = ({ from, to, map = false, plugins = [], format = 'iife', name = '' }, config) => {
	const absoluteFrom = fs.join(config.from, from);
	const absoluteTo   = fs.join(config.from, to);
	const absoluteMap  = typeof map === 'string' ? fs.join(config.from, map) : map;

	return rollup.rollup({
		cache: cache,
		entry: absoluteFrom,
		plugins: plugins.map(
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
		),
		onwarn: () => undefined
	}).then(
		(bundle) => {
			// generated result
			const result = bundle.generate({
				format: format,
				moduleName: name,
				sourceMap: Boolean(map),
				sourceMapFile: absoluteMap
			});

			// sourcemap annotation
			const sourcemapAnnotation = map && map !== true ? `//# sourceMappingURL=${ fs.relative(
				fs.dirname(absoluteTo),
				absoluteMap
			) }` : '';

			// promise written compiled files
			return (
				typeof map === 'string'
				? Promise.all([
					fs.writeFile(absoluteTo,  String(result.code) + sourcemapAnnotation),
					fs.writeFile(absoluteMap, String(result.map))
				])
				: fs.writeFile(absoluteTo, String(result.code))
			).then(
				// promise contents
				() => String(result.code) + sourcemapAnnotation
			);
		}
	)
};
