// tooling
const exec = require('../exec');

// promise executed command
module.exports = (configOpts, { from }) => exec('npm install --only=production', {
	cwd: from
});
