// tooling
const exec  = require('./lib/exec');
const color = require('./lib/color');
const fs    = require('./lib/fs');
const log   = require('./lib/log');
const mime  = require('mime-types');

// host files
module.exports = (config = require('./lib/config')) => {
	// include default configurations
	const {
		dist = 'dist',
		port = 8080,
		key,
		crt
	} = config;

	const resolvedDist = fs.join(config.from, dist);

	const onrequest = (request, response) => {
		// resolved file
		let file = fs.resolve(resolvedDist, request.url.slice(1));

		const onreadfile = (content) => {
			// respond successfully with file contents
			response.writeHead(200, {
				'Content-Type': mime.contentType(fs.basename(file))
			});

			response.end(content, mime.charset(fs.basename(file)));
		};

		// Promise resolved file is read
		fs.readFile(file).then(
			onreadfile,
			(error) => {
				if (error.code === 'EISDIR') {
					// redirect to index.html if the request is for a directory
					file = fs.resolve(file, 'index.html');

					// promise resolve index.html from directory
					return fs.readFile(file).then(onreadfile);
				} else {
					throw error;
				}
			}
		).catch(
			(error) => {
				if (error.code === 'ENOENT') {
					// respond unsuccessfully if the file is not found
					response.writeHead(404, {
						'Content-Type': mime.contentType(fs.basename(file))
					});

					response.end('<h1>Not Found</h1>', mime.charset(fs.basename(file)));
				}
			}
		);
	};

	Promise.all([
		// SSL keys
		key ? fs.readFile(key) : Promise.reject(),
		crt ? fs.readFile(crt) : Promise.reject()
	]).then(
		(buffers) => {
			// server
			require('https').createServer({
				key:  buffers[0].toString(),
				cert: buffers[1].toString()
			}, onrequest).listen(port);

			// report current server url
			log.line(`Server running at ${ color.green(`https://localhost:${ port }/`) }`);
		},
		() => {
			// server
			require('http').createServer(onrequest).listen(port);

			// report current server url
			log.line(`Server running at ${ color.green(`http://localhost:${ port }/`) }`);
		}
	).then(
		// watch for file changes
		() => require('./live')(config)
	).then(
		() => exec(`${ process.platform === 'win32' ? 'start' : 'open' } http://localhost:${ port }/`)
	);
};
