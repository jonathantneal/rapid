// tooling
const eslit = require('eslit');
const fs    = require('../fs');

module.exports = ({ from, to, data, before = '', after = '' }, config = {}) => Promise.resolve([
	fs.join(config.from, from),
	fs.join(config.from, to),
	typeof data === 'string' ? fs.join(config.from, data) : data
]).then(
	(args) => {
		eslit.cwd = config.from;

		return args;
	}
).then(
	// promise captured context
	([ absoluteFrom, absoluteTo, absoluteData ]) => Promise.resolve(
		typeof absoluteData === 'string'
		? fs.readFile(absoluteData, 'utf8').then(
			// promise parsed source context or an empty object
			(content) => JSON.parse(content),
			() => ({})
		)
		: Promise.resolve(data)
	).then(
		// promise compiled source with context
		(context) => eslit.import(absoluteFrom, context)
	).then(
		// promise written compiled source
		(content) => `${ Array.isArray(before) ? before.join('') : before }${ content }${ Array.isArray(after) ? after.join('') : after }`
	).then(
		(content) => fs.writeFile(absoluteTo, content).then(
			// promise content
			() => `${ Array.isArray(before) ? before.join('') : before }${ content }${ Array.isArray(after) ? after.join('') : after }`
		)
	)
);
