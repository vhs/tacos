"use strict";

var Promise = require('bluebird'),
    _ = require('underscore'),
	debug = require('debug')('atoms:terminalsStore'),
	getLine = require('./utils').getLine,
	config = require('./config'),
	EventEmitter = require('events').EventEmitter,
    emitter = new EventEmitter(),
	loki = require( 'lokijs' ),
	terminalDB = new loki( 'shared/terminalsStore.json' ),
	CryptoJS = require("crypto-js");

var terminals = {};
	
terminalDB.loadDatabase( {}, function() {
	debug( getLine(), "Loading database..." );
	debug( getLine(), "Loading terminals collection..." );
	terminals = terminalDB.getCollection( 'terminals' );
	if( terminals === null ) {
		debug( getLine(), "Collection not found!" );
		debug( getLine(), "Adding collection!" );
		terminals = terminalDB.addCollection( 'terminals', { indices: ['id'], autoupdate: true } );
	}
});

setInterval( function() {
	debug( getLine(), "Autosaving" );
	terminalDB.saveDatabase();
}, 10000 );

var getAllTerminals = function() {
	return terminals.find({'id': { '$ne' : '' }});
};

module.exports.getAllTerminals = getAllTerminals;

var getAvailableTerminals = function( user ) {
	var terminals_list = {};
	
	getAllTerminals().forEach( function( terminal ) {
		if( checkTerminalAccess( terminal.id, user ) )
			terminals_list[terminal.id] = terminal;
	});
	
	return terminals_list;
};

module.exports.getAvailableTerminals = getAvailableTerminals;

var registerTerminal = function( terminal_id ) {
	let terminalResult = terminals.findOne( { 'id': terminal_id } );
	
	if( terminalResult === null ) {
		terminalResult = {
			"id" : terminal_id,
			"description" : terminal_id,
			"target" : "",
			"enabled" : 0,
			"secure" : 0,
			"secret" : ""
		};
		
		terminalResult = terminals.insert( terminalResult );
	}
	
	terminalResult.last_seen = Date.now();
	
	terminals.update( terminalResult );
	
	return terminalResult;
};

module.exports.registerTerminal = registerTerminal;

var enableTerminal = function( terminal_id ) {
	let terminalResult = terminals.findOne( { 'id': terminal_id } );

	if( terminalResult === null )
		return { "error" : "No such terminal" };
	
	terminalResult.enabled = 1;
	
	var result = {};
	result.id = terminalResult.id;
	result.enabled = terminalResult.enabled;
	
	return getTerminalDetails( terminal_id );
};

module.exports.enableTerminal = enableTerminal;

var disableTerminal = function( terminal_id ) {
	let terminalResult = terminals.findOne( { 'id': terminal_id } );

	if( terminalResult === null )
		return { "error" : "No such terminal" };
	
	terminalResult.enabled = 0;
	
	return getTerminalDetails( terminal_id );
};

module.exports.disableTerminal = disableTerminal;

var updateTerminalDescription = function( terminal_id, description ) {
	let terminalResult = terminals.findOne( { 'id': terminal_id } );
	
	terminalResult.description = description;
	
	return getTerminalDetails( terminal_id );
};

module.exports.updateTerminalDescription = updateTerminalDescription;

var updateTerminalEnabled = function( terminal_id, toggle ) {
	let terminalResult = terminals.findOne( { 'id': terminal_id } );
	
	debug( typeof toggle );
	
	if( toggle == 'true' ) {
		terminalResult.enabled = true;
	} else {
		terminalResult.description = false;
	}
	
	return getTerminalDetails( terminal_id );
};

module.exports.updateTerminalEnabled = updateTerminalEnabled;

var updateTerminalSecret = function( terminal_id, secret ) {
	let terminalResult = terminals.findOne( { 'id': terminal_id } );

	terminalResult.secret = secret;
	
	return getTerminalDetails( terminal_id );
};

module.exports.updateTerminalSecret = updateTerminalSecret;

var updateTerminalTarget = function( terminal_id, target ) {
	let terminalResult = terminals.findOne( { 'id': terminal_id } );
	
	terminalResult.target = target;
	
	return getTerminalDetails( terminal_id );
};

module.exports.updateTerminalTarget = updateTerminalTarget;

var updateTerminalHasSecret = function( terminal_id, hasSecret ) {
	let terminalResult = terminals.findOne( { 'id': terminal_id } );

	terminalResult.hasSecret = hasSecret;
	
	return getTerminalDetails( terminal_id );
};

module.exports.updateTerminalHasSecret = updateTerminalHasSecret;

var getTerminalList = function() {
	return getAllTerminals();
};

module.exports.getTerminalList = getTerminalList;

var checkTerminalEnabled = function( terminal_id ) {
	let terminalResult = terminals.findOne( { 'id': terminal_id } );
	
	debug( terminalResult );

	if( terminalResult && terminalResult.enabled === true )
		return true;
	
	return false;
};

module.exports.checkTerminalEnabled = checkTerminalEnabled;

var checkTerminalHasTarget = function( terminal_id ) {
	let terminalResult = terminals.findOne( { 'id': terminal_id } );

	if( terminalResult && terminalResult.target !== "" )
		return true;
	
	return false;
};

module.exports.checkTerminalHasTarget = checkTerminalHasTarget;

var getTerminalTarget = function( terminal_id ) {
	let terminalResult = terminals.findOne( { 'id': terminal_id } );
	
	return terminalResult.target;
};

module.exports.getTerminalTarget = getTerminalTarget;

var getTerminalState = function( terminal_id ) {
	let terminalResult = registerTerminal( terminal_id );

	let result = {};
	result.result = "OK";
	result.hasTarget = terminalResult.target.length ? true : false;
	result.secure = terminalResult.secure;
	
	return result;
};

module.exports.getTerminalState = getTerminalState;

var getTerminalDetails = function( terminal_id ) {
	let terminalResult = terminals.findOne( { 'id': terminal_id } );

	if( terminalResult === null )
		return { "error" : "No such terminal" };
	
	let result = {};
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
	let terminalResult = terminals.chain().find( { 'id': { '$eq' : terminal_id } } ).remove().data();

	if( terminalResult.length === 0 )
		return true;
	
	return false;
};

module.exports.deleteTerminal = deleteTerminal;

var checkTerminalExists = function( terminal_id ) {
	let terminalResult = terminals.findOne( { 'id': terminal_id } );

	if( terminalResult !== null )
		return true;
	
	return false;
};

module.exports.checkTerminalExists = checkTerminalExists;

var checkTerminalSecured = function( terminal_id ) {
	debug( getLine(), "checkTerminalSecured" );
	let terminalResult = terminals.findOne( { 'id': terminal_id } );
	
	if( terminalResult !== null && ( terminalResult.secure == 1 || terminalResult.secret !== '' ) )
		return true;
	
	return false;
};

module.exports.checkTerminalSecured = checkTerminalSecured;

var setTerminalSecure = function( terminal_id ) {
	let terminalResult = terminals.findOne( { 'id': terminal_id } );
	
	terminalResult.secure = 1;
};

module.exports.setTerminalSecure = setTerminalSecure;

var checkTerminalAccess = function( terminal_id, user ) {
	if( user.administrator )
		return true;

	let terminalResult = terminals.findOne( { 'id': terminal_id } );

	if( user.privileges.indexOf( terminalResult.role ) >= 0 )
		return true;

	return false;
};

module.exports.checkTerminalAccess = checkTerminalAccess;

var verifyHMAC = function( terminal_id, packet ) {
	let terminalResult = terminals.findOne( { 'id' : terminal_id } );
	
	if( ! terminalResult )
		return false;
	
	let data = packet.data;
	let hash = packet.hash;
	
	let key = data.nonce + data.ts + terminalResult.secret;
	
	debug( getLine(), packet );
	debug( getLine(), JSON.stringify( packet ) );
	debug( getLine(), JSON.stringify( packet.data ) );

	let checked_hash = CryptoJS.HmacSHA256( JSON.stringify( data ), key ).toString();
	
	debug( getLine(), "verifyHMAC", "ts", packet.data.ts, "vs", Math.round(Date.now()/1000), "=", ( Math.round(Date.now()/1000) - parseInt( packet.data.ts ) ) );
	
	if( checked_hash !== hash ) {
		debug( getLine(), "verifyHMAC: incorrect hash" );
		debug( getLine(), "Got:", hash );
		debug( getLine(), "Expected:", checked_hash );
		terminalResult.secure = 0;
		return false;
	} else if( ( packet.data.ts < (Math.round(Date.now()/1000)-30) ) || ( packet.data.ts > (Math.round(Date.now()/1000)+30) ) ) {
		// We calculate to epoch from node native millisecond time
		debug( getLine(), "verifyHMAC: time out of scope - replay attack?" );
		return false;
	}
	
	terminalResult.secure = 1;
	
	return true;
};

module.exports.verifyHMAC = verifyHMAC;