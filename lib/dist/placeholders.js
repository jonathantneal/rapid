// tooling
const fs = require('../fs');

module.exports = ({ from, to }, config = {}) => Promise.resolve([
	fs.join(config.from, from),
	fs.join(config.from, to)
]).then(
	// promise source copied to destination
	([ absoluteFrom, absoluteTo ]) => fs.mkdir(absoluteTo).then(
		() => fs.copydir(absoluteFrom, absoluteTo)
	)
);
