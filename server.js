var debug = require('debug')('app:web');
var app = require('./app');

app.app();

var server = app.server;

server.listen(process.env.PORT || 3004, function() {
  debug('Express server listening on port ' + server.address().port);
});