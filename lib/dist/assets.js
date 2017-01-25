// tooling
const fs = require('../fs');

module.exports = ({ from, to }, config = {}) => Promise.resolve([
	fs.join(config.from, from),
	fs.join(config.from, to)
]).then(
	// promise source directory files
	([ absoluteFrom, absoluteTo ]) => fs.mkdir(absoluteTo).then(
		() => fs.readdir(absoluteFrom)
	).then(
		// promise all copied files
		(files) => Promise.all(
			files.map(
				(file) => fs.copyFile(
					fs.join(absoluteFrom, file),
					fs.join(absoluteTo, file)
				)
			)
		).then(
			// do not return promises
			() => {}
		),
		(error) => {
			// if assets directory is not missing
			if (error.code !== 'ENOENT') {
				// throw error
				throw error;
			}
		}
	)
);
