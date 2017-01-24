"use strict";

var express = require('express'),
    debug = require('debug')('app:web'),
    devicesStore = require('../devicesStore'),
    router = express.Router(),
	requireAuthenticated = require('./auth').requireAuthenticated,
	requireAdmin = require('./auth').requireAdmin;

var requireValidDevice = function(req, res, next) {
	var device_id = req.params.id;
	
	if( device_id == undefined || ! devicesStore.checkDeviceExists( device_id ) ) {
		res.result = { message: "Missing device" }
		next('route');
	}
}

var requireToolAccess = function(req, res, next) {
	var device_id = req.params.id;
	
	if( device_id == undefined ) {
		res.result = { message: "Missing device" }
		next('route');
	}

    if (req.user && devicesStore.checkDeviceAccess( device_id, req.user.privileges ) ) {
        return next();
    }

    next({
        statusCode: 401,
        message: "Access Denied"
    });
};

// Set result array
router.use("/", function(req, res, next){
    res.result = {};

    next();
});

// Query state
router.get("/state/:id", function(req, res, next){
	if( ! req.params.id ) {
		res.result.message = "error: missing device id";
		next();
	}
	
	var device_id = req.params.id;
	
	res.result = devicesStore.getDeviceState( device_id );
	
    next();
});

// Query state
router.get("/details/:id", function(req, res, next){
	if( ! req.params.id ) {
		res.result.message = "error: missing device id";
		next();
	}
	
	var device_id = req.params.id;
	
	res.result = devicesStore.getDeviceDetails( device_id );
	
    next();
});

// Update device role
router.post("/update/role/:id", requireAuthenticated, requireAdmin, function(req, res, next){
	if( ! req.params.id ) {
		res.result.message = "error: missing role id";
		next();
	}
	
	var device_id = req.params.id;
	var role = req.body.role;

	res.result = devicesStore.updateDeviceRole( device_id, role );

    next();
});

// Update device role
router.post("/update/description/:id", requireAuthenticated, requireAdmin, function(req, res, next){
	if( ! req.params.id || req.params.id === 0 ) {
		res.result.message = "error: missing device id";
		next('route');
	}
	
	var device_id = req.params.id;
	var description = req.body.description;

	res.result = devicesStore.updateDeviceDescription( device_id, description );

    next();
});

// Activate device
router.post("/arm/:id", requireAuthenticated, requireToolAccess, function(req, res, next){
	if( ! req.params.id ) {
		res.result.message = "error: missing device id";
		next();
	}
	
	var device_id = req.params.id;

	res.result = devicesStore.armDevice( device_id );

    next();
});

// Deactivate device
router.post("/unarm/:id", requireAuthenticated, requireToolAccess, function(req, res, next){
	if( ! req.params.id ) {
		res.result.message = "error: missing device id";
		next();
	}
	
	var device_id = req.params.id;

	res.result = devicesStore.unarmDevice( device_id );

    next();
});

// Convert to JSON
router.use("/", function(req, res, next){
    if (Object.keys(res.result).length>0){
        return res.json(res.result);
    }
    var err = new Error('Not Found');
    err.statusCode = 404;
    next(err);
});

// Export the router
module.exports.router = router;

// Module specific erroHandlers
module.exports.addErrorHandlers = function(app, path){
    app.use(path, function(err, req, res, next){ // jshint ignore:line
        var response = {
            "msg": err.message,
            "type": err.type,
            "status": err.statusCode || 500
        };
        if (response.status === 500) {
            debug(err);
        }
        res.status(err.statusCode || 500);
        return res.json(response);
    });
};
