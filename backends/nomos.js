'use strict';

var config = require('../config'),
    _ = require('underscore'),
    debug = require('debug')('atoms:backend-nomos'),
    getLine = require('../lib/utils').getLine,
	request = require('request'),
	rp = require('request-promise');


debug( getLine(), "Loading nomos backend" );

var roles = [];
var roles_last_loaded = Date.now();

var loadRoles = function() {
	debug( getLine(), "loading roles" );
	
	var params = {
		"page": 0,
		"size": 25,
		"columns": "id,name,code,description,enabled",
		"order": "name",
		"filters":{
			"column": "code",
			"operator": "like",
			"value": "tool:%"
		}
	};
	
	var options = {
		method : 'POST',	
		url: config[config.backend].userRolesUrl,
		headers: {
			'X-Api-Key': config[config.backend].credentials.key
		},
		json: true,
		body: params
	};
	
	return rp( options ).then( function( roles_result ) {
		debug( getLine(), "got data:" );
		debug( getLine(), roles_result );
		
		if( typeof roles_result == 'object' && roles_result.length > 0 ) {
			roles = roles_result;
		}
		
		debug( getLine(), "Roles:", roles );
		
		roles_last_loaded = Date.now();
		
		return roles;
	}).catch( function( err ) {
		debug( getLine(), "error caught" );
		return {"valid": false, error: true};
	});
};

loadRoles();

var getRoles = function() {
	debug( getLine(), "getRoles" );
	if( roles.length === 0 || ( ( roles_last_loaded + 60000 ) < Date.now() ) )
		loadRoles();
	
	return roles;
};

module.exports.getRoles = getRoles;

var checkUser = function( user ){
	debug( getLine(), "checkUser" );
	var service = user.provider;
	var id = user.id;
	
	debug( getLine(), "Service Name: " + service );
	debug( getLine(), "Service ID: " + id );
	
	var params = {};
	params.service = service;
	params.id = id;
	
	var options = {
		method : 'POST',	
		url: config[config.backend].userAuthUrl,
		headers: {
			'X-Api-Key': config[config.backend].credentials.key
		},
		json: true,
		body: params
	};
    
	return rp( options ).then( function( user_result ){
        debug( getLine(), user_result );
        var authenticated = false;
        if (user_result && user_result.valid && user_result.privileges){
			// Save username
			user.username = user_result.username;
			
			// Set defaults
			user.administrator = false;
			user.privileges = [];
			
			// Get default privileges
			_.each( user_result.privileges, function( priv ) {
				user.privileges.push( priv.code );
			});
			
			// If the user has the administrator_role, set administrator
			if( user.privileges.indexOf( config.administrator_role ) >= 0 ) {
				user.administrator = true;
			}
			
			// Else if user is Nomos administrator override administrator
			if( user.privileges.indexOf( "administrator" ) >= 0 ) {
				user.administrator = true;
			}

			// Set as authenticated
			authenticated = true;
        }
        
        return authenticated;
    }).catch( function( err ) {
		debug( getLine(), "caught error" );
        //Log this for now and proceed to the next promise
        console.error(err);
        return {"valid": false, error: true};
    });
};

module.exports.checkUser = checkUser;

var checkRFIDCard = function( card_request ){
	debug( getLine(), "checkRFIDCard" );
	debug( getLine(), card_request );
	
	var params = {};
	params.rfid = card_request.id;
	
	var options = {
		method : 'POST',	
		url: config[config.backend].cardAuthUrl,
		headers: {
			'X-Api-Key': config[config.backend].credentials.key
		},
		json: true,
		body: params
	};
	
	return rp( options ).then( function( card_result ) {
		debug( getLine(), "got CheckRFID result:", card_result.valid );
		var valid = false;
		if( card_result && card_result.valid ) {
			// Save valid
			valid = card_request.valid = card_result.valid;
			
			// Set defaults
			card_request.privileges = [];
			card_request.administrator = false;
			
			if( valid ) {
				// Save username
				card_request.username = card_result.username;
				
				// Get default privileges
				_.each( card_result.privileges, function( priv ) {
					card_request.privileges.push( priv.code );
				});
				
				// If the user has the administrator_role, set administrator
				if( card_request.privileges.indexOf( config.administrator_role ) >= 0 ) {
					debug( getLine(), "User", card_request.username, "has administrator_role" );
					card_request.administrator = true;
				}
				
				// Else if user is Nomos administrator override administrator
				if( card_request.privileges.indexOf( "administrator" ) >= 0 ) {
					debug( getLine(), "User", card_request.username, "is administrator" );
					card_request.administrator = true;
				}
			}
		}
		
		return valid;
	}).catch( function( err ) {
		debug( getLine(), "caught error" );
		//Log this for now and proceed to the next promise
		debug( getLine(), err );
		return { "valid": false, error: true };
	});
};

module.exports.checkRFIDCard = checkRFIDCard;