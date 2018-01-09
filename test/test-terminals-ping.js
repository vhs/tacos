"use strict";

var config = require("./config");
var CryptoJS = require("crypto-js");
var randomstring = require("randomstring");
var request = require('request-promise');
var Packeteer = require('./packeteer');
var debug = require('debug')('test:terminals-ping');
var getLine = require('../utils').getLine;

var scenarios = [
	{ "id" : "ping1", "terminal_id" : "reader1" },
	{ "id" : "ping2", "terminal_id" : "reader2" }
];

function doScenario( scenario, done ) {
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

describe('Terminal Ping tests', function(){

    it( "check for tablesaw1", function( done ) {
        doScenario( scenarios[0], done );
    });

    it("check for tablesaw2", function( done ){
        doScenario( scenarios[1], done );
    });

});
