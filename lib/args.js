// dash option capturing
const dash = /^--([^=]+)=(.+)$/;

// dashed arguments
module.exports = Object.assign(
	{},
	...process.argv.filter(
		(arg) => dash.test(arg)
	).map(
		(arg) => arg.match(dash).slice(1)
	).map(
		(arg) => ({
			[arg[0]]: arg[1]
		})
	),
	...process.argv.filter(
		(arg) => !dash.test(arg)
	).map(
		(arg, index) => ({
			[index]: arg
		})
	)
);
