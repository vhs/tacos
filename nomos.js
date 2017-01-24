'use strict';

var config = require('./config'),
    _ = require('underscore'),
    debug = require('debug')('app:nomos'),
	Promise = this.Promise || require('promise'),
	agent = require('superagent-promise')(require('superagent'), Promise);

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
			debug( "checkAuth: 20" );
            //Log this for now and proceed to the next promise
            console.error(err);
            return {"valid": false, error: true};
        })
        .then(function(user_result){
            debug(user_result);
            var authenticated = false;
            if (user_result && user_result.valid && user_result.privileges){
				// Save username
				user.username = user_result.username;
				
				user.administrator = false;
				user.privileges = {};
				
				// Loop over user_result privileges, save the privileges to the user, and set administrator if the user has the administrator_role
                _.each(user_result.privileges, function(priv){
					user.privileges[priv.code] = priv;
                    if( priv.code == config.administrator_role ){
                        user.administrator = true;
                    }
                });
				
				// Else if user is Nomos administrator override administrator
				if( user.privileges.administrator !== undefined )
					user.administrator = true;
				
				authenticated = true;
            }
            return authenticated;
        });
};