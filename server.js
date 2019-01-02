"use strict";

var debug = require('debug')('app:web'),
	getLine = require('./lib/utils').getLine,
	app = require('./app');

app.app();

var server = app.server;

server.listen(process.env.PORT || 3004, function() {
  debug( getLine(), 'Express server listening on port ' + server.address().port);
});
