# rapid [<img src="https://upload.wikimedia.org/wikipedia/commons/9/99/Unofficial_JavaScript_logo_2.svg" alt="Colorwheel" width="90" height="90" align="right">][rapid]

[![Build Status][cli-img]][cli-url]
[![Licensing][lic-img]][lic-url]
[![Changelog][log-img]][log-url]

[rapid] helps you quickly create web components.

```sh
npm install jonathantneal/rapid --save-dev
```

Assign rapid to the `start` script in `package.json`.

```json
{
  "scripts": {
    "start": "rapid"
  }
}
```

And **rapid** may be used directly in Node.

```js
const rapid = require('rapid');
```

### Usage

```sh
npm start make # project has been created
```

The `make` command creates empty scaffolding for you, containing markup (`index.jsx`), style (`index.css`), functionality (`index.js`), and content (`index.json`).

```sh
npm start dist # project has been updated
```

The `dist` command compiles your project into a `dist` folder.

```sh
npm start live # project is listening for changes...
```

The `live` command listens to change to your project and compiles them on demand.

```sh
npm start host # Server running at http://localhost:8080
```

The `host` command creates a server to see your changes. It also watches your project for changes.

```sh
npm start link # project is linked...
```

The `link` command links local dependencies so you can edit them directly to push changes to your component.

### Options

**rapid** may be configured from `package.json` or `.config.js`.

```json
{
  "main": "my-functionality.js",
  "context": "my-markup-data.json",
  "style": "my-style.css",
  "template": "my-markup.jsx"
}
```

```js
module.exports = {
	html: {
		from: 'my-markup.jsx',
		data: 'my-markup-data.json'
	},
	css: {
		from: 'my-style.css'
	},
	js: {
		from: 'my-functionality.js'
	}
}
```

Options may also be set within `rapid` in `package.json`.

```js
{
  "rapid": {
    "html": {
      "from": "my-markup.jsx"
      "data": "my-markup-data.json"
    },
    "css": {
      "from": "my-style.css"
    },
    "js": {
      "from": "my-functionality.js"
    }
  }
}
```

Out of the box, **rapid** uses [rollup] to compile JavaScript, [PostCSS] to compile CSS, and [eslit] to compile HTML. No plugins for those tools are included by default.

[rollup] and [PostCSS] plugins may be configured from `package.json` or `.config.js`. Use an array to pass options to a plugin.

```json
{
  "rapid": {
    "css": {
      "plugins": [
        "postcss-import",
        "postcss-cssnext",
        ["cssnano", { "autoprefixer": false }]
      ]
    },
    "js": {
      "plugins": [
        "rollup-plugin-node-resolve",
        ["rollup-plugin-babel", {
          "presets": [
            ["es2015", { "modules": false }]
          ],
          "plugins": [
            "external-helpers"
          ]
        }],
        "rollup-plugin-uglify"
      ]
    }
  }
}
```

[rapid]: https://github.com/jonathantneal/rapid

[rollup]: http://rollupjs.org/
[PostCSS]: http://postcss.org/
[eslit]: https://github.com/jonathantneal/eslit
[template literals]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals

[npm-url]: https://www.npmjs.com/package/rapid
[npm-img]: https://img.shields.io/npm/v/rapid.svg
[cli-url]: https://travis-ci.org/jonathantneal/rapid
[cli-img]: https://img.shields.io/travis/jonathantneal/rapid.svg
[lic-url]: LICENSE.md
[lic-img]: https://img.shields.io/badge/license-CC0--1.0-blue.svg
[log-url]: CHANGELOG.md
[log-img]: https://img.shields.io/badge/changelog-md-blue.svg
[git-url]: https://gitter.im/jonathantneal/rapid
[git-img]: https://img.shields.io/badge/chat-gitter-blue.svg
