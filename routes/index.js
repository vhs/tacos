"use strict";

var express = require('express'),
    auth = require('./auth'),
    devices = require('./devices'),
    terminals = require('./terminals'),
	devicesStore = require('../devicesStore'),
    debug = require('debug')('app:web'),
    app = require('../app'),
    api = require('./api'),
    sio = require('../socket'),
	config = require('../config'),
    router = express.Router();

var backend = require('../' + config.backend );

function devicesStatuses(req, res, next) {
	if( req.user ) {
		if( req.user.administrator ) {
			res.locals.devices = devicesStore.getAllDevices();
		} else {
			res.locals.devices = devicesStore.getAvailableDevices( req.user );
		}
	}
    next();
}

router.use('/', function(req, res, next){
    res.locals.user = req.user;
	res.locals.roles = backend.getRoles();
	req.session.touch();
    next();
});

// Only on development
var environment = process.env.NODE_ENV || 'development';

if( environment == 'development' )
	router.all('/reload', process.exit);

/* Placeholder homepage */
router.get('/', devicesStatuses, function(req, res, next) {
    res.render('index', { title: 'VHS:ATOMS' });
});

router.use('/api', api.router);
router.use('/auth', auth.router);
router.use('/devices', devices.router);
router.use('/terminals', terminals.router);

module.exports.router = router;

module.exports.addMiddleware = function(app){
    auth.addMiddleware(app);
    // sio.io.on('connection', function (socket) {
    //    socket.emit('status', laser.getStatus());
    // });
};

module.exports.addErrorHandlers = function(app){
    api.addErrorHandlers(app, '/api');
    devices.addErrorHandlers(app, '/devices');
    terminals.addErrorHandlers(app, '/terminals');
};