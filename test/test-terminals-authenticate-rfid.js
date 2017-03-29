"use strict";

var config = require("./config");
var CryptoJS = require("crypto-js");
var randomstring = require("randomstring");
var request = require('request');
var Packeteer = require('./packeteer');
var debug = require('debug')('test:terminals-authenticate-rfid');
var getLine = require('../utils').getLine;

var scenarios = [
	{ "id" : "test1", "card_id" : "04:F3:63:EA:50:49:80", "terminal_id" : "reader1" }, 
	{ "id" : "test2", "card_id" : "04:F3:63:EA:50:49:81", "terminal_id" : "reader1" },
	{ "id" : "test3", "card_id" : "04:F3:63:EA:50:49:82", "terminal_id" : "reader1" },
	{ "id" : "test4", "card_id" : "04:F3:63:EA:50:49:80", "terminal_id" : "reader2" },
	{ "id" : "test5", "card_id" : "04:F3:63:EA:50:49:81", "terminal_id" : "reader2" }, 
	{ "id" : "test6", "card_id" : "04:F3:63:EA:50:49:82", "terminal_id" : "reader2" } 
];

for( var s = 0 ; s < scenarios.length ; s++ ) {
	doTest( scenarios[s] );
}

function doTest( scenario ) {
	var data = {};
	data.card_id = scenario.card_id;
	
	var packeteer = new Packeteer( data );
	
	var packet = packeteer.getSignedPacket( config.secrets[scenario.terminal_id] );
	
	request.post({
		url : config.url + "/terminals/authenticate/rfid/" + scenario.terminal_id,
		json : true,
		form : packet
	}, function( err, httpResponse, body ) {
		if( err ) {
			debug( getLine(), scenario.id, err );
		} else {
			debug( getLine(), scenario.id, httpResponse.statusCode );
			debug( getLine(), scenario.id, "====================================" );
			debug( getLine(), scenario.id, body );
		}
	
	});
}
