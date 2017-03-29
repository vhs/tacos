"use strict";

var config = require("./config");
var CryptoJS = require("crypto-js");
var randomstring = require("randomstring");
var request = require('request');
var Packeteer = require('./packeteer');
var debug = require('debug')('test:terminals-authenticate-rfid');
var getLine = require('../utils').getLine;

var scenarios = [
	{ "id" : "test1", "device_id" : "tablesaw1" }, 
	{ "id" : "test2", "device_id" : "tablesaw2" }, 
];

for( var s = 0 ; s < scenarios.length ; s++ ) {
	doTest( scenarios[s] );
}

function doTest( scenario ) {
	
	request.get( config.url + "/devices/state/" + scenario.device_id, function( err, httpResponse, body ) {
		if( err ) {
			debug( getLine(), scenario.id, err );
		} else {
			debug( getLine(), scenario.id, httpResponse.statusCode );
			debug( getLine(), scenario.id, "====================================" );
			debug( getLine(), scenario.id, body );
		}
	
	});
}
