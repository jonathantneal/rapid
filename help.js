// tooling
const log = require('./lib/log');

module.exports = () => log.line(`
   Usage: rapid [task] [directory]

   Tasks:

     host                 (default) starts a local server hosting a component
     dist                 compiles a component
     link                 links local components
     live                 compiles a component on demand
     make                 creates a new component
     npmi                 installs dependencies of a component
     npmu                 uninstalls dependencies of a component

     help                 see these options
`);
