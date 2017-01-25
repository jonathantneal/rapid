// tooling
const fs = require('./lib/fs');
// const log = require('./lib/log');

// messaging
// const msgLinking = 'is unlinking';
// const msgLinked  = 'has been unlinked.';
// const msgFailure = 'had an issue unlinking.';

// unlink local packages // log.wait(config.name, msgLinking) &&
module.exports = (config = require('./lib/config')) => fs.readFile(
	// read package
	fs.join(config.from, 'package.json'),
	'utf8'
).then(
	// package dependencies
	(contents) => JSON.parse(contents).dependencies || {}
).then(
	(dependencies) => Promise.all(
		Object.keys(dependencies).filter(
			// local packages
			(key) => /^file:/.test(dependencies[key])
		).map(
			// from (source), to (node_modules destination)
			(key) => ({
				from: fs.resolve(config.from, dependencies[key].slice(5)),
				to:   fs.join(config.from, 'node_modules', key)
			})
		).map(
			({ to }) => fs.lstat(to).then(
				// remove existing link or continue without errors
				(stat) => stat.isSymbolicLink() ? fs.unlink(to) : Promise.resolve(),
				() => Promise.resolve()
			)
		)
	)
);
// .then(
// 	// report completion or errors
// 	()      => log.pass(config.name, msgLinked),
// 	(error) => log.fail(config.name, msgFailure, error)
// );
