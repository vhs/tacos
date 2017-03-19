'use strict';

var config = require('./config'),
    _ = require('underscore'),
    debug = require('debug')('app:nomos'),
	Promise = this.Promise || require('promise'),
	agent = require('superagent-promise')(require('superagent'), Promise);

var roles = [];
var roles_last_loaded = Date.now();

var loadRoles = function() {
	debug( "nomos.js[12]: loading roles" );
	
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
	}
	
	return agent( 'POST', config[config.backend].rolesUrl )
	.set( 'X-Api-Key', config[config.backend].credentials.key )
	.send( params )
	.end()
	.then( function( res ){
		return JSON.parse( res.text );
	})
	.catch( function( err ) {
		debug( "nomos.js[19]: error caught" );
		
		//Log this for now and proceed to the next promise
		console.error(err);
		
		return {"valid": false, error: true};
	})
	.then( function( roles_result ) {
		debug( "nomos.js[25]: error caught" );
		
		if( typeof roles_result == 'object' && roles_result.length > 0 ) {
			roles = roles_result;
		}
		
		return roles;
	});
}

loadRoles();

var getRoles = function() {
	if( roles.length == 0 || ( roles_last_loaded < ( Date.now() - 60000 ) ) )
		loadRoles();
	
	return roles;
}

module.exports.getRoles = getRoles;

module.exports.checkUser = function( user ){
	var service = user.provider;
	var id = user.id;
	
	debug( service );
	debug( id );
    
	return agent('POST', config[config.backend].authUrl)
        .send({service:service, id:id})
        .set('X-Api-Key', config[config.backend].credentials.key)
        .end()
        .then(function(res){
            return JSON.parse(res.text);
        })
        .catch(function(err){
			debug( "nomos[58]: caught error" );
            //Log this for now and proceed to the next promise
            console.error(err);
            return {"valid": false, error: true};
        })
        .then( function(user_result){
            debug(user_result);
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
				
				// Set administrator if the user has the administrator_role
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
        });
};