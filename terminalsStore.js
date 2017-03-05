"use strict";

var Promise = require('bluebird'),
    _ = require('underscore'),
	debug = require('debug')('app:terminalsStore'),
	config = require('./config'),
	EventEmitter = require('events').EventEmitter,
    emitter = new EventEmitter(),
	loki = require( 'lokijs' ),
	lokiDB = new loki( 'shared/terminalsStore.json' );

var terminals = {};
	
lokiDB.loadDatabase( {}, function() {
	debug( "Loading database..." );
	debug( "Loading terminals collection..." );
	terminals = lokiDB.getCollection( 'terminals' );
	if( terminals == null ) {
		debug( "Collection not found!" );
		debug( "Adding collection!" );
		terminals = lokiDB.addCollection( 'terminals', { indices: ['id'], autoupdate: true } );
	}
});

setInterval( function() {
	debug( "Autosaving" );
	lokiDB.saveDatabase();
}, 10000 );

var getAllTerminals = function() {
	return terminals.find({'id': { '$ne' : '' }});
}

module.exports.getAllTerminals = getAllTerminals;

var getAvailableTerminals = function( user ) {
	var terminals_list = {};
	
	getAllTerminals().forEach( function( terminal ) {
		if( checkTerminalAccess( terminal.id, user ) )
			terminals_list[terminal.id] = terminal;
	});
	
	return terminals_list;
}

module.exports.getAvailableTerminals = getAvailableTerminals;

var registerTerminal = function( terminal_id ) {
	var terminalResult = terminals.findOne( { 'id': terminal_id } );
	
	if( terminalResult === null ) {
		terminalResult = {
			"id" : terminal_id,
			"description" : terminal_id,
			"target" : "",
			"enabled" : 0,
			"secure" : 0,
			"secret" : ""
		};
		
		var terminalResult = terminals.insert( terminalResult );
		
		terminalResult = terminals.findOne( { 'id': terminal_id } );
	}
	
	terminalResult.last_seen = Date.now();
	
	terminals.update( terminalResult );
	
	return terminalResult;
}

module.exports.registerTerminal = registerTerminal;

var enableTerminal = function( terminal_id ) {
	var terminalResult = terminals.findOne( { 'id': terminal_id } );

	if( terminalResult === null )
		return result = { "error" : "No such terminal" };
	
	terminalResult.enabled = 1;
	
	var result = {};
	result.id = terminalResult.id;
	result.enabled = terminalResult.enabled;
	
	return getTerminalDetails( terminal_id );
};

module.exports.enableTerminal = enableTerminal;

var disableTerminal = function( terminal_id ) {
	var terminalResult = terminals.findOne( { 'id': terminal_id } );

	if( terminalResult === null )
		return result = { "error" : "No such terminal" };
	
	terminalResult.enabled = 0;
	
	return getTerminalDetails( terminal_id );
};

module.exports.disableTerminal = disableTerminal;

var updateTerminalDescription = function( terminal_id, description ) {
	var terminalResult = terminals.findOne( { 'id': terminal_id } );
	
	terminalResult.description = description;
	
	return getTerminalDetails( terminal_id );
}

module.exports.updateTerminalDescription = updateTerminalDescription;

var updateTerminalTarget = function( terminal_id, target ) {
	var terminalResult = terminals.findOne( { 'id': terminal_id } );
	
	terminalResult.target = target;
	
	return getTerminalDetails( terminal_id );
}

module.exports.updateTerminalRole = updateTerminalRole;

var deleteTerminalSecret = function( terminal_id, secret ) {
	var terminalResult = terminals.findOne( { 'id': terminal_id } );

	terminalResult.secret = null;
	
	return getTerminalDetails( terminal_id );
}

module.exports.deleteTerminalSecret = deleteTerminalSecret;

var updateTerminalHasSecret = function( terminal_id, hasSecret ) {
	var terminalResult = terminals.findOne( { 'id': terminal_id } );

	terminalResult.hasSecret = hasSecret;
	
	return getTerminalDetails( terminal_id );
}

module.exports.updateTerminalHasSecret = updateTerminalHasSecret;

var updateTerminalSecret = function( terminal_id, secret ) {
	var terminalResult = terminals.findOne( { 'id': terminal_id } );

	terminalResult.secret = secret;
	
	return getTerminalDetails( terminal_id );
}

module.exports.updateTerminalSecret = updateTerminalSecret;

var getTerminalList = function() {
	return getAllTerminals();
};

module.exports.getTerminalList = getTerminalList;

var getTerminalState = function( terminal_id ) {
	var terminalResult = registerTerminal( terminal_id );

	var result = {};
	result.success = true;
	result.id = terminalResult.id;
	result.state = {};
	result.state.powered = terminalResult.powered;
	
	if( ( terminalResult.activation_expiry < Date.now() ) ) {
		result.state.powered = terminalResult.powered = 0;
	}
	
	return result;
};

module.exports.getTerminalState = getTerminalState;

var getTerminalDetails = function( terminal_id ) {
	var terminalResult = terminals.findOne( { 'id': terminal_id } );

	if( terminalResult === null )
		return result = { "error" : "No such terminal" };
	
	var result = {};
	result.success = true;
	result.id = terminalResult.id;
	result.last_seen = terminalResult.last_seen;
	result.state = {};
	result.state.powered = terminalResult.powered;
	
	if( ( terminalResult.activation_expiry < Date.now() ) ) {
		result.state.powered = terminalResult.powered = 0;
	}
	
	return result;
};

module.exports.getTerminalDetails = getTerminalDetails;

var deleteTerminal = function( terminal_id ) {
	var terminalResult = terminals.chain().find( { 'id': { '$eq' : terminal_id } } ).remove().data();

	if( terminalResult.length == 0 )
		return true;
	
	return false;
};

module.exports.deleteTerminal = deleteTerminal;

var checkTerminalExists = function( terminal_id ) {
	var terminalResult = terminals.findOne( { 'id': terminal_id } );

	if( terminalResult !== null )
		return true;
	
	return false;
}

module.exports.checkTerminalExists = checkTerminalExists;

var checkTerminalAccess = function( terminal_id, user ) {
	if( user.administrator )
		return true;

	var terminalResult = terminals.findOne( { 'id': terminal_id } );

	if( user.privileges.indexOf( terminalResult.role ) >= 0 )
		return true;

	return false;
};

module.exports.checkTerminalAccess = checkTerminalAccess;