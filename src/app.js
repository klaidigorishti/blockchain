#!/usr/bin/env node

const vorpal = require('vorpal')();
vorpal.use(require('./controllers/cmd.js'));