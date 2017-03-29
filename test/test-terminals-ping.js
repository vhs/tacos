"use strict";

var config = require("./config");
var CryptoJS = require("crypto-js");
var randomstring = require("randomstring");
var request = require('request');
var Packeteer = require('./packeteer');
var debug = require('debug')('test:terminals-authenticate-rfid');
var getLine = require('../utils').getLine;

var scenarios = [
	{ "id" : "ping1", "terminal_id" : "reader1" },
	{ "id" : "ping2", "terminal_id" : "reader2" }
];

for( var s = 0 ; s < scenarios.length ; s++ ) {
	doTest( scenarios[s] );
}

function doTest( scenario ) {
	var data = {};
	data.ping = randomstring.generate(128);
	
	var packeteer = new Packeteer( data );
	
	var packet = packeteer.getSignedPacket( config.secrets[scenario.terminal_id] );
	
	request.post({
		url : config.url + "/terminals/ping/" + scenario.terminal_id,
		json: true,
		form : packet
	}, function( err, httpResponse, body ) {
		if( err ) {
			debug( getLine(), scenario.id,err );
		} else {
			debug( getLine(), scenario.id, "Response code: " + httpResponse.statusCode );
			debug( getLine(), scenario.id, "------------------------------------------" );
			debug( getLine(), scenario.id, body );
		}
		
	});
}
