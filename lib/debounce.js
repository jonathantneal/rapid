// postponed execution
module.exports = (fn, delay) => {
	let timeout = null;

	return (...args) => {
		clearTimeout(timeout);

		timeout = setTimeout(() => {
			fn.apply(this, args);
		}, delay);
	};
};
