"use strict";

var config = require("./config");
var CryptoJS = require("crypto-js");
var randomstring = require("randomstring");
var request = require('request');
var Packeteer = require('./packeteer');
var debug = require('debug')('test:terminals-authenticate-rfid');
var getLine = require('../utils').getLine;

var scenarios = [
	{ "id" : "test1", "card_id" : "04:F3:63:EA:50:49:80", "terminal_id" : "reader1", "response" : { "result" : "OK" } },
	{ "id" : "test2", "card_id" : "04:F3:63:EA:50:49:81", "terminal_id" : "reader1", "response" : { "result" : "ERROR" } },
	{ "id" : "test3", "card_id" : "04:F3:63:EA:50:49:82", "terminal_id" : "reader1", "response" : { "result" : "ERROR" } },
	{ "id" : "test4", "card_id" : "04:F3:63:EA:50:49:80", "terminal_id" : "reader2", "response" : { "result" : "ERROR" } },
	{ "id" : "test5", "card_id" : "04:F3:63:EA:50:49:81", "terminal_id" : "reader2", "response" : { "result" : "ERROR" } }, 
	{ "id" : "test6", "card_id" : "04:F3:63:EA:50:49:82", "terminal_id" : "reader2", "response" : { "result" : "ERROR" }  }
];

function doScenario( scenario, done ) {
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
			debug( getLine(), scenario.id, JSON.stringify( packet ) );
			debug( getLine(), scenario.id, "====================================" );
			debug( getLine(), scenario.id, body );
			
			if( scenario.response.result == body.result )
				done();
		}
	
	});
}

describe('Terminal Authenticate RFID tests', function(){

    it( "check for reader1 for card1", function( done ) {
        doScenario( scenarios[0], done );
    });

    it("check for reader1 for card2", function( done ){
        doScenario( scenarios[1], done );
    });

    it( "check for reader1 for card3", function( done ) {
        doScenario( scenarios[2], done );
    });

    it("check for reader2 for card1", function( done ){
        doScenario( scenarios[3], done );
    });

    it( "check for reader2 for card2", function( done ) {
        doScenario( scenarios[4], done );
    });

    it("check for reader2 for card3", function( done ){
        doScenario( scenarios[5], done );
    });

});
