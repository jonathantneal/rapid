// tooling
const zlib = require('zlib');

// gzip size of a string
module.exports = (result) => new Promise(
	(resolve, reject) => result ?
		zlib.gzip(result, {
			level: 9
		}, (error, data) => {
			if (error) {
				reject(error);
			} else {
				resolve(pretty(data.length));
			}
		}) :
		resolve()
);

// human readable bytes
function pretty(bytes) {
	var units = ['b', 'kb', 'mb', 'gb', 'tb', 'pb', 'eb', 'zb', 'yb'];
	var ndx = Math.floor(Math.log(bytes) / Math.log(1024));

	return Math.round(bytes / Math.pow(1024, ndx) * 100) / 100 + units[ndx];
}
