// tooling
const exec = require('./lib/exec');
const log  = require('./lib/log');

// messaging
const msgUpdating = 'is installing';

// uninstall package
module.exports = (config = require('./lib/config'), ...pkgs) => log.wait(config.name, `${ msgUpdating } ${ pkgs.join(' ') }`) && exec(`npm uninstall ${ pkgs.join(' ') }`, {
	cwd: config.from
}).then(
	(result) => log.pass(config.name, result),
	(error)  => log.fail(config.name, error)
);
