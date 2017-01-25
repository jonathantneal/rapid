// tooling
const Events = require('events');
const fs     = require('fs');
const match  = require('minimatch');
const path   = require('path');

// exports extended
Object.assign(
	exports,
	// path
	path,
	// fs
	fs,
	// fs then-ified
	...[
		'access',
		'appendFile',
		'chmod',
		'chown',
		'close',
		'exists',
		'fchmod',
		'fchown',
		'fdatasync',
		'fstat',
		'fsync',
		'ftruncate',
		'futimes',
		'lchmod',
		'lchown',
		'link',
		'lstat',
		'mkdtemp',
		'open',
		'read',
		'readdir',
		'readFile',
		'readlink',
		'realpath',
		'rename',
		'rmdir',
		'stat',
		'symlink',
		'truncate',
		'unlink',
		'utimes',
		'write',
		'write'
	].map(
		(name) => ({
			[name]: (pathname, ...args) => new Promise(
				(resolve, reject) => fs[name](
					pathname,
					...args,
					(error, data) => error ? reject(error) : resolve(data)
				)
			)
		})
	),
	// mkdir / writeFile, then-ified and mkdir-ified
	...['mkdir', 'writeFile'].map(
		(key) => ({
			[key]: (pathname, ...args) => new Promise(
				(resolve, reject) => fs[key](
					pathname,
					...args,
					(error, data) =>
						// if there is no parent directory
						error && error.code === 'ENOENT'
						// resolve with a promise to make the parent directory
						? resolve(
							exports.mkdir(
								path.dirname(pathname)
							).then(
								// and then try again
								() => exports[key](pathname, ...args)
							)
						)
						// otherwise
						:
							// if there is an error not about the directory already existing
							error && error.code !== 'EEXIST'
							// reject with the error
							? reject(error)
							// otherwise, resolve
							: resolve(data)
				)
			)
		})
	),
	// copydir, then-ified
	{
		copydir: (source, target) => exports.mkdir(target).then(
			// make the target directory, then read the source directory
			(...result) => exports.readdir(source).then(
				// promise all copied children
				(children) => Promise.all(
					children.map(
						// resolved children
						(child) => [
							path.resolve(source, child),
							path.resolve(target, child)
						]
					).map(
						// direct child to appropriate action
						([sourceChild, targetChild]) => exports.lstat(sourceChild).then(
							(stat) => stat.isDirectory()
							? exports.copydir(sourceChild, targetChild)
							: exports.copyFile(sourceChild, targetChild)
						)
					)
				).then(
					() => Promise.resolve(...result)
				)
			)
		)
	},
	// copyFile, then-ified
	{
		copyFile: (source, target) => new Promise(
			(resolve, reject) => {
				// create streams
				const readStream  = exports.createReadStream(source);
				const writeStream = exports.createWriteStream(target);

				// reject on read error
				readStream.on('error', prereject);

				// reject on write error
				writeStream.on('error', prereject);

				// resolve on finish
				writeStream.on('finish', resolve);

				// copy stream
				readStream.pipe(writeStream);

				function prereject(error) {
					// destroy streams
					readStream.destroy();
					writeStream.end();

					// reject with error
					reject(error);
				}
			}
		)
	},
	// rmdir, then-ified
	{
		rmdir: (pathname, ...args) => new Promise(
			// remove the directory
			(resolve, reject) => fs.rmdir(
				pathname,
				...args,
				(error, ...result) => error
				? error.code === 'ENOTEMPTY'
				// if the error is about a non-empty directory
				? resolve(
					exports.readdir(pathname).then(
						// promise for each child of the current pathname
						(children) => Promise.all(
							children.map(
								// resolved child
								(child) => path.resolve(pathname, child)
							).map(
								(resolvedChild) => exports.lstat(resolvedChild).then(
									(stat) => stat.isDirectory()
									// if child is a directory, remove it
									? exports.rmdir(resolvedChild, ...args)
									// otherwise, delete it from the file system
									: exports.unlink(resolvedChild)
								)
							)
						)
					).then(
						// afterward, attempt to delete the directory again
						() => exports.rmdir(pathname, ...args)
					)
				)
				// otherwise, reject the error
				: reject(error)
				// otherwise, resolve with the result
				: resolve(...result)
			)
		)
	},
	// match, from minimatch
	{
		match: match
	},
	// touchFile, then-ified
	{
		touchFile: (filename) => new Promise(
			// promise touched file
			(resolve, reject) => fs.open(
				filename,
				'wx',
				(error, data) =>
					// if there is no parent directory
					error && error.code === 'ENOENT'
					// resolve with a promise to make the parent directory
					? resolve(
						exports.mkdir(
							path.dirname(filename)
						).then(
							// and then try again
							() => exports.touchFile(filename)
						)
					)
					// otherwise
					:
						// if there is an error not about the directory already existing
						error && error.code !== 'EEXIST'
						// reject with the error
						? reject(error)
						// otherwise, resolve
						: resolve(data)
			)
		)
	},
	// watch, then-ified
	{
		watch(pathname, ...args) {
			// options
			const opts = typeof args[0] !== 'function' ? args.shift() : {};

			// callback
			const cb = args[0];

			// watcher
			const watcher = new FSWatcher(pathname, opts);

			if (cb) {
				// if a callback is specified, bind it
				watcher.on('change', cb);
			}

			return watcher;
		}
	}
);

// FSWatcher with symlink support
class FSWatcher extends Events {
	constructor(filename, opts = { recursive: true }) {
		// emitter
		const emitter = super();

		// emitter watchers
		emitter.watchers = [];

		// resolved filename
		const resolvedFilename = path.resolve(filename);

		// options without recursive
		const optsSansRecursive = Object.assign({}, opts, { recursive: false });

		// then-ified watch promising watchers
		const watcher = watch(resolvedFilename).then(
			() => ({
				emitter: emitter
			})
		);

		// ignore pattern(s) as an array
		const ignores = Array.isArray(opts.ignore) ? opts.ignore : [opts.ignore];

		// promise then bound to watcher
		emitter.then = watcher.then.bind(watcher);

		// then-ified watch
		function watch(watchedFilename) {
			// get normalized inner filename
			const resolvedWatchedFilename = path.resolve(resolvedFilename, watchedFilename);

			// push watch emitter to watchers array
			emitter.watchers.push(
				// watch emitter forwards changes using relative filepath
				fs.watch(
					resolvedWatchedFilename,
					optsSansRecursive,
					(eventType, triggeredFilename) => emitter.emit(
						'change',
						eventType,
						path.relative(
							resolvedFilename,
							path.join(
								resolvedWatchedFilename,
								triggeredFilename
							)
						)
					)
				)
			);

			return opts.recursive
			// if recursive, promise that all files are read
			? exports.readdir(resolvedWatchedFilename).then(
				// promise for each child of the watched dir
				(children) => Promise.all(
					children.map(
						// resolved child
						(child) => path.join(resolvedWatchedFilename, child)
					).filter(
						// handle ignore patterns early
						(resolvedChild) => !ignores.some(
							(ignore) => match(
								path.relative(
									resolvedFilename,
									resolvedChild
								),
								ignore,
								opts
							)
						)
					// direct child
					).map(directChild)
				),
				(error) => {
					if (error.code === 'ENOTDIR') {
						// if watching a file, resolve
						return Promise.resolve();
					}

					// otherwise, throw the error
					throw error;
				}
			)
			// otherwise, resolve an empty promise
			: Promise.resolve();
		}

		// direct child to appropriate action
		function directChild(child) {
			// child statistics
			return exports.lstat(child).then(
				// if the child is a directory
				(stat) => stat.isDirectory()
				// watch it
				? watch(child)
				// otherwise, if the child is a symbolic link
				: stat.isSymbolicLink()
				// direct the link as a child
				? exports.readlink(child).then(
					(realChild) => path.resolve(child, realChild)
				).then(directChild)
				// otherwise, resolve an empty promise
				: Promise.resolve(),
				() => Promise.resolve()
			);
		}
	}
}
