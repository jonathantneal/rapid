const resolve = require('resolve');

module.exports = (id, opts = {}) => require(
	resolve.sync(
		id,
		Object.assign({}, module.exports, opts)
	)
);
