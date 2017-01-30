// whether the source is object-like
const isObject = (source) => source === Object(source) && !(source instanceof Array);

// copy nested enumerables from source objects to a target object
const deepAssign = module.exports = (target, ...sources) => {
	sources.forEach(
		(source) => {
			Object.keys(source).map(
				(key) => {
					target[key] = isObject(target[key]) && isObject(source[key]) ? deepAssign(target[key], source[key]) : source[key];
				}
			)
		}
	);

	return target;
};
