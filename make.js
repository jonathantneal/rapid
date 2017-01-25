// tooling
const fs  = require('./lib/fs');
const log = require('./lib/log');

// messaging
const msgCreating = 'is being created...';
const msgCreated  = 'has been created.';
const msgFailure  = 'had an issue creating.';

// create project
module.exports = (config = require('./lib/config')) => Promise.resolve(
	Object.keys(config.defaults).filter(
		(opt) => config[opt]
	).reduce(
		(resolve, opt) => resolve.then(
			// report initialization and create files and directory
			() => log.wait(`${ opt } ${ fs.basename(config[opt].from || `index.${ opt.replace('jsx', 'html') }`) } ${ msgCreating }`) && (
				opt === 'assets' ? fs.mkdir(config[opt].from) : fs.touchFile(
					config[opt].from
				)
			)
		).then(
			// report completion or errors
			()      => log.pass(config.name, `${ fs.basename(config[opt].from || `index.${ opt }`) } ${ msgCreated }`),
			(error) => log.fail(config.name, `${ fs.basename(config[opt].from || `index.${ opt }`) } ${ msgFailure }`, error)
		),
		Promise.resolve()
	)
);
