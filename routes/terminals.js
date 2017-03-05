"use strict";

var express = require('express'),
    debug = require('debug')('app:web'),
    terminalsStore = require('../terminalsStore'),
    terminalsStore = require('../terminalsStore'),
    router = express.Router(),
	requireAuthenticated = require('./auth').requireAuthenticated,
	requireAdmin = require('./auth').requireAdmin;

var requireValidTerminal = function(req, res, next) {
	var terminal_id = req.params.id;
	
	if( terminal_id == undefined || ! terminalsStore.checkTerminalExists( terminal_id ) ) {
		res.result = { message: "Missing terminal" }
		next('route');
	}
}

function terminalStatuses(req, res, next) {
	res.locals.terminals = terminalsStore.getAllTerminals();
    next();
}

// Set result array
router.use("/", requireAuthenticated, requireAdmin, function(req, res, next){
    res.result = {};

    next();
});

router.get('/', terminalStatuses, function(req, res, next) {
    res.locals.user = req.user;
	req.session.touch();
    res.render('terminals', { title: 'VHS:ATOMS' });
});

// Query state
router.get("/ping/:id", function(req, res, next){
	if( ! req.params.id ) {
		res.result.message = "error: missing terminal id";
		next();
	}
	
	var terminal_id = req.params.id;
	
	res.result = terminalsStore.getTerminalState( terminal_id );
	
    next();
});

// Query state
router.get("/state/:id", function(req, res, next){
	if( ! req.params.id ) {
		res.result.message = "error: missing terminal id";
		next();
	}
	
	var terminal_id = req.params.id;
	
	res.result = terminalsStore.getTerminalState( terminal_id );
	
    next();
});

// Query state
router.get("/details/:id", function(req, res, next){
	if( ! req.params.id ) {
		res.result.message = "error: missing terminal id";
		next();
	}
	
	var terminal_id = req.params.id;
	
	res.result = terminalsStore.getTerminalDetails( terminal_id );
	
    next();
});

// Enable terminal
router.post("/enable/:id", requireAuthenticated, requireAdmin, function(req, res, next){
	if( ! req.params.id ) {
		res.result.message = "error: missing terminal id";
		next();
	}
	
	var terminal_id = req.params.id;

	res.result = terminalsStore.enableTerminal( terminal_id );

    next();
});

// Disable terminal
router.post("/disable/:id", requireAuthenticated, requireAdmin, function(req, res, next){
	if( ! req.params.id ) {
		res.result.message = "error: missing terminal id";
		next();
	}
	
	var terminal_id = req.params.id;

	res.result = terminalsStore.disableTerminal( terminal_id );

    next();
});

// Delete terminal
router.post("/delete/:id", requireAuthenticated, requireAdmin, function(req, res, next){
	if( ! req.params.id ) {
		res.result.message = "error: missing terminal id";
		next();
	}
	
	var terminal_id = req.params.id;
	
	res.result = {};

	if( terminalsStore.deleteTerminal( terminal_id ) )
		res.result = { result: "ok" };

    next();
});

// Update terminal role
router.post("/update/target/:id", requireAuthenticated, requireAdmin, function(req, res, next){
	if( ! req.params.id ) {
		res.result.message = "error: missing role id";
		next();
	}
	
	var terminal_id = req.params.id;
	var role = req.body.role;

	res.result = terminalsStore.updateTerminalRole( terminal_id, role );

    next();
});

// Update terminal role
router.post("/update/description/:id", requireAuthenticated, requireAdmin, function(req, res, next){
	if( ! req.params.id || req.params.id === 0 ) {
		res.result.message = "error: missing terminal id";
		next('route');
	}
	
	var terminal_id = req.params.id;
	var description = req.body.description;

	res.result = terminalsStore.updateTerminalDescription( terminal_id, description );

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
