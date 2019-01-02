"use strict";

var express = require( 'express' ),
	debug = require( 'debug' )( 'atoms:routes:terminals' ),
	getLine = require('../lib/utils').getLine,
	devicesStore = require( '../devicesStore' ),
	terminalsStore = require( '../terminalsStore' ),
	checkTerminalExists = require( '../terminalsStore' ).checkTerminalExists,
	router = express.Router(),
	requireAuthenticated = require( './auth' ).requireAuthenticated,
	requireAdmin = require( './auth' ).requireAdmin;

var config = require( '../config' );

var backend = require( '../backends/' + config.backend );

function requireValidTerminal( req, res, next ) {
	debug( getLine(), "requireValidTerminal" );
	
	var terminal_id = req.params.id;

	if( terminal_id ==- undefined || ! terminalsStore.checkTerminalExists( terminal_id ) ) {
		res.result = {
			message : "Missing terminal"
		};
		next( 'route' );
	}
}

function terminalStatuses( req, res, next ) {
	debug( getLine(), "terminalStatuses" );
	
	res.locals.terminals = terminalsStore.getAllTerminals();
	next();
}

// Default get result
function handleDefaultRequest( req, res, next ) {
	debug( getLine(), "handleDefaultRequest" );
	
	res.locals.user = req.user;
	req.session.touch();
	res.locals.devices = devicesStore.getAllDevices();
	debug( res.locals.devices );
	res.render( 'terminals', {
		title : 'VHS:ATOMS'
	} );
}

// Set result array
function setDefaultResultArray( req, res, next ) {
	debug( getLine(), "setDefaultResultArray" );
	
    res.result = { "result" : "ERROR" };
    
    if( typeof req.body != 'object' )
		req.body = JSON.parse( req.body );

    next();
}

// Query state
function processTerminalPing( req, res, next ) {
	debug( getLine(), "processTerminalPing" );

	if( req.body.data.ping === undefined ) {
		res.result.message = "error: missing ping message";
	} else {
		res.result.result = 'OK';
		res.result.pong = req.body.data.ping;
	}
	
	next();
}

// Query state
function getTerminalState( req, res, next ) {
	debug( getLine(), "getTerminalState" );
	
	if( ! req.params.id ) {
		res.result.message = "error: missing terminal id";
		next();
	}
	
	if( typeof req.body != 'object' )
		req.body = JSON.parse( req.body );
	
	var terminal_id = req.params.id;
	
	res.result = terminalsStore.getTerminalState( terminal_id );
	res.result.timestamp = Math.floor( Date.now() / 1000 );
	
	next();
}

// Query state
function getTerminalDetails( req, res, next ) {
	debug( getLine(), "getTerminalDetails" );
	
	if( ! req.params.id ) {
		res.result.message = "error: missing terminal id";
		next();
	}
	
	var terminal_id = req.params.id;
	
	res.result = terminalsStore.getTerminalDetails( terminal_id );
	
	next();
}

function verifyTerminal( req, res, next ) {
	debug( getLine(), "verifyTerminal" );
	
	debug( getLine(), "verifyTerminal: [" + req.params.id + "]" );
	
	// Check terminal_id
	if( ! req.params.id ) {
		res.result.message = "error: missing terminal id";
//		res.status( 403 ).send( JSON.stringify( res.result ) );
		res.status( 403 );
		next('route');
	} else if( ! terminalsStore.checkTerminalExists( req.params.id ) ) {
		res.result.message = "error: no such terminal ";
//		res.status( 403 ).send( JSON.stringify( res.result ) );
		res.status( 403 );
		next('route');
	} else {
		next();
	}
}

function verifyTerminalEnabled( req, res, next ) {
	debug( getLine(), "verifyTerminalEnabled" );
	
	var verified = false;
	
	if( ! terminalsStore.checkTerminalEnabled( req.params.id ) ) {
		res.result.message = "error: terminal is not enabled";
		res.status( 403 ).send( JSON.stringify( res.result ) );
	} else if( ! terminalsStore.checkTerminalHasTarget( req.params.id ) ) {
		res.result.message = "error: terminal doesn't have a target";
		res.status( 403 ).send( JSON.stringify( res.result ) );
	} else {
		next();
	}
}

function verifyHMAC( req, res, next ) {
	debug( getLine(), "verifyHMAC" );
	
	var terminal_id = req.params.id;
	
	if( ! terminalsStore.checkTerminalSecured( terminal_id ) ) {
		res.result.message = "error: missing secret";
		res.status( 403 ).send( JSON.stringify( res.result ) );
	} else if( req.body.data === undefined || req.body.hash === undefined ) {
		debug( getLine(), JSON.stringify( req.body ) );
		res.result.message = "error: incorrect message format, missing authentication data";
		res.send( JSON.stringify( res.result ) );
	} else if( ! req.body.data.nonce || ! req.body.data.ts || ! req.body.hash ) {
		res.result.message = "error: missing auth data";
		res.status( 403 ).send( JSON.stringify( res.result ) );
	} else {
		debug( getLine(), "Checking HMAC" );
		// Packet looks good and terminal has secret, check HMAC
		var packet = req.body;

		if( ! terminalsStore.verifyHMAC( terminal_id, packet ) ) {
			res.result.message = "error: HMAC verification failed";
			res.status( 403 ).send( JSON.stringify( res.result ) );
		} else {
			next();
		}
	}
}

function authenticateRFIDCard( req, res, next ) {
	debug( getLine(), "authenticateRFIDCard" );
	
	// Check input
	
	// Check message data
	if( ! req.body.data && ! req.body.data.card_id ) {
		res.result.message = "error: missing card id";
		next('route');
	}
	
	
	var terminal_id = req.params.id;
	var card_id = req.body.data.card_id;

	debug( getLine(), "authenticateRFIDCard", terminal_id );
	
	// Get target
	var terminal_target = terminalsStore.getTerminalTarget( terminal_id );
	// Get target role
	var device_role = devicesStore.getDeviceRole( terminal_target );
	debug( getLine(), "device_role", device_role );
	// Check user privilege for role
	var card_request = {};
	card_request.id = card_id;
	backend.checkRFIDCard( card_request ).then( function( done ) {
		if( ! card_request.valid ) {
			console.log( Date.now() + ": RFID ACCESS DENIED for " + card_request.id );
			res.result.message = "ACCESS DENIED: invalid card id";
			next('route');
		} else {
			// Check role against received privileges
			if( card_request.administrator || card_request.privileges.indexOf( device_role ) >= 0 ) {
				console.log( Date.now() + ": RFID ACCESS PERMITTED for " + card_request.id + " - " + card_request.username );
				
				// Arm device
				var armResult = devicesStore.armDevice( terminal_target );
				if( ! armResult ) {
					res.result.message = 'Failed to arm device';
				} else {
					res.result.message = 'ACCESS GRANTED - Device armed';
					res.result.result = 'OK';
				}
			} else {
				console.log( Date.now() + ": RFID ACCESS DENIED for " + card_request.id + " - " + card_request.username );
				res.result.message = 'ACCESS DENIED';
			}
			next('route');
		}
	});
}

//Enable terminal
function updateTerminalDescription( req, res, next ) {
	debug( getLine(), "updateTerminalDescription" );
	
	if( ! req.params.id ) {
		res.result.message = "error: missing terminal id";
		debug( res.result.message );
		next();
	} else if( ! req.body.description ) {
		res.result.message = "error: missing description";
		debug( res.result.message );
		next();
	} else {
		
		var terminal_id = req.params.id;
		
		var description = req.body.description;
		
		res.result = terminalsStore.updateTerminalDescription( terminal_id, description );
		
		next();
		
	}
}

//Enable terminal
function updateTerminalEnabled( req, res, next ) {
	debug( getLine(), "updateTerminalEnabled" );
	
	if( ! req.params.id ) {
		res.result.message = "error: missing terminal id";
		debug( res.result.message );
		next();
	} else if( ! req.body.enabled ) {
		res.result.message = "error: missing enabled";
		debug( res.result.message );
		next();
	} else {
		
		var terminal_id = req.params.id;
		
		res.result = terminalsStore.updateTerminalEnabled( terminal_id, req.body.enabled );
		
		debug( res.result );
		
		next();
		
	}
}

//Delete terminal
function deleteTerminal( req, res, next ) {
	debug( getLine(), "deleteTerminal" );
	
	if( ! req.params.id ) {
		res.result.message = "error: missing terminal id";
		next();
	}

	var terminal_id = req.params.id;

	res.result = {};

	if( terminalsStore.deleteTerminal( terminal_id ) ) res.result = {
		result : "ok"
	};

	next();
}

// Update terminal secret
function updateTerminalSecret(req, res, next) {
	debug( getLine(), "updateTerminalSecret" );
	
	if (!req.params.id || req.params.id === 0) {
		res.result.message = "error: missing terminal id";
		next('route');
	}
	
	var terminal_id = req.params.id;
	var secret = req.body.secret;
	
	res.result = terminalsStore.updateTerminalSecret( terminal_id, secret );
	
	next();
}

//Update terminal role
function updateTerminalTarget( req, res, next ) {
	debug( getLine(), "updateTerminalTarget" );
	
	 if( ! req.params.id ) {
		    res.result.message = "error: missing role id";
		    next();
	 }

	 var terminal_id = req.params.id;
	 var target = req.body.target;
	
	 res.result = terminalsStore.updateTerminalTarget( terminal_id, target );
	
	 next();
}

//Convert to JSON
function convertToJSON( req, res, next ) {
	debug( getLine(), "convertToJSON" );

	if( Object.keys( res.result ).length > 0 ) {
		return res.json( res.result );
	}
	var err = new Error( 'Not Found' );
	err.statusCode = 404;
	next( err );
}

// route definitions
debug( getLine(), "Setting route definitions" );

// Default get request (for terminal listing in the web gui)
router.get( '/', terminalStatuses, handleDefaultRequest );

// Default result set for API requests
router.use( "/", setDefaultResultArray );

// Get terminal state (device query)
router.get( "/state/:id", getTerminalState );

// Get terminal details (web console)
router.get( "/details/:id", getTerminalDetails );

// Authenticated requests

// Terminal ping
router.post( "/ping/:id", verifyTerminal, verifyHMAC, processTerminalPing );

// Authenticated terminal for an rfid
router.post( "/authenticate/rfid/:id", verifyTerminal, verifyTerminalEnabled, verifyHMAC, authenticateRFIDCard );

// Web console
router.post( "/delete/:id", requireAuthenticated, requireAdmin, deleteTerminal );
router.post( "/update/description/:id", requireAuthenticated, requireAdmin, updateTerminalDescription );
router.post( "/update/enabled/:id", requireAuthenticated, requireAdmin, updateTerminalEnabled );
router.post( "/update/secret/:id", requireAuthenticated, requireAdmin, updateTerminalSecret );
router.post( "/update/target/:id", requireAuthenticated, requireAdmin, updateTerminalTarget );

router.use( "/", convertToJSON );

// Export the router
module.exports.router = router;

// Module specific erroHandlers
module.exports.addErrorHandlers = function( app, path ) {
	app.use( path, function( err, req, res, next ) { // jshint ignore:line
		var response = {
		    "msg" : err.message,
		    "type" : err.type,
		    "status" : err.statusCode || 500
		};
		if( response.status === 500 ) {
			debug( err );
		}
		res.status( err.statusCode || 500 );
		return res.json( response );
	} );
};
