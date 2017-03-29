"use strict";

var config = require('./config'),
    _ = require('underscore'),
    debug = require('debug')('app:nomos'),
	Promise = this.Promise || require('promise'),
	agent = require('superagent-promise')(require('superagent'), Promise);

var checkAuth = function(service, id){
	console.log( service );
	console.log( id );
	console.log( config[config.backend].authUrl );
	return agent('POST', config[config.backend].authUrl)
	.send({service:service, id:id})
	.set('X-Api-Key', config[config.backend].credentials.key)
	.end()
	.then(function(res){
		console.log( "checkAuth: 16" );
		return JSON.parse(res.text);
	})
	.catch(function(err){
		console.log( "checkAuth: 20" );
		// Log this for now and proceed to the next promise
		console.error(err);
		return {"valid": false, error: true};
	})
	.then(function(user){
		console.log( "checkAuth: 25" );
		debug(user);
		var hasRole = false;
		if (user && user.valid && user.privileges){
			_.each(user.privileges, function(priv){
				if (priv.code === 'laser'){
					hasRole = true;
				}
			});
		}
		return hasRole;
	});
};	

console.log( checkAuth( 'github', 3118952 ) );
