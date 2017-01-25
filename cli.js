#!/usr/bin/env node

// rapid
const rapid = require('.');

// desired rapid task or the host task using the config
(rapid[process.argv[2]] || rapid.host)();
