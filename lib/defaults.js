module.exports = {
	npm: {
		from: 'package.json',
		watch: ['package.json']
	},
	html: {
		from: 'index.html',
		to: 'dist/index.html',
		data: 'index.json',
		before: [
			'<!doctype html>',
			'<meta charset="utf-8">',
			'<meta name="viewport" content="width=device-width,initial-scale=1">',
			'<meta http-equiv="X-UA-Compatible" content="IE=edge">',
			'<link href="index.css" rel="stylesheet">',
			'<script src="index.js"></script>'
		].join(''),
		after: '',
		watch: ['*.{html,jsx}', '!(package).json']
	},
	css: {
		from:  'index.css',
		to:    'dist/index.css',
		map:   'dist/index.css.map',
		watch: ['*.css']
	},
	js: {
		from:  'index.js',
		to:    'dist/index.js',
		map:   'dist/index.js.map',
		watch: ['*.js']
	},
	placeholders: {
		from:  'placeholders',
		to:    'dist',
		watch: ['placeholders/**']
	}
};
