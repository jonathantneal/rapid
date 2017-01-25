// tooling
const args = require('./args');
const fs   = require('./fs');

// current working directory
const cwd = 3 in args ? fs.resolve(args[3]) : process.cwd();

// initialized config
const config = {
	defaults: require('./defaults'),
	from:     cwd,
	ignore:   ['node_modules', 'dist', '.DS_Store*', 'Thumbs.db*'],
	name:     'project',
	rate:     1000 / 30
};

// extend a config
const useExtends = (cfg) => {
	if (typeof cfg.extends === 'string') {
		try {
			Object.assign(
				cfg,
				require(
					cfg.extends.replace(/^(rapid-config-)?/, 'rapid-config-')
				)
			);
		} catch (error) {
			// continue regardless of error
		}
	}
}

// assign defaults
Object.keys(config.defaults).forEach(
	(key) => {
		config[key] = Object.assign({}, config.defaults[key]);
	}
);

// assign package.json
try {
	// package
	const pkg = require(
		fs.join(cwd, 'package.json')
	);

	// package config
	const cfg = pkg.rapid || {};

	// extend package config
	useExtends(cfg);

	// assign name from package
	if (typeof pkg.name === 'string' && !cfg.name) {
		cfg.name = pkg.name;
	}

	// assign html context from package config
	if (typeof pkg.context === 'string' && (!cfg.html || !cfg.html.data)) {
		cfg.html = cfg.html || {};
		cfg.html.data = pkg.context;
	}

	// assign html template from package config
	if (typeof pkg.template === 'string' && (!cfg.html || !cfg.html.from)) {
		cfg.html = cfg.html || {};
		cfg.html.from = pkg.template;
	}

	// assign js from package config
	if (typeof pkg.main === 'string' && (!cfg.js || !cfg.js.from)) {
		cfg.js = cfg.js || {};
		cfg.js.from = pkg.main;
	}

	// assign css from package config
	if (typeof pkg.style === 'string' && (!cfg.css || !cfg.css.from)) {
		cfg.css = cfg.css || {};
		cfg.css.from = pkg.style;
	}

	// assign ignore from package config
	if (Array.isArray(cfg.ignore)) {
		config.ignore = cfg.ignore;
	}

	// assign name from package config
	if (typeof cfg.name === 'string') {
		config.name = cfg.name;
	}

	// update config with default keys from package config
	Object.keys(config.defaults).forEach(
		(key) => {
			Object.assign(config[key], cfg[key]);
		}
	);
} catch (error) {
	// continue regardless of error
}

// assign local config
try {
	// local config
	const localConfig = require(
		fs.join(cwd, '.config')
	);

	// extend local config
	useExtends(localConfig);

	// update config with local config
	Object.assign(config, localConfig);
} catch (error) {
	// continue regardless of error
}

module.exports = config;
