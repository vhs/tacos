"use strict";

var config = require("./config");
var CryptoJS = require("crypto-js");
var randomstring = require("randomstring");
var request = require('request-promise');
var Packeteer = require('./packeteer');
var debug = require('debug')('test:devices-state');
var getLine = require('../utils').getLine;

var scenarios = [
	{ "id" : "test1", "device_id" : "tablesaw1" }, 
	{ "id" : "test2", "device_id" : "tablesaw2" }, 
];

function doScenario( scenario, done ) {
	return request.get( config.url + "/devices/state/" + scenario.device_id )
	.then( function( response ) {
		debug( getLine(), scenario.id, response );
		done();
		return true;
	}).catch( function( err ) {
		debug( getLine(), scenario.id, err );
		return false;
	});
}

describe('Device State tests', function(){

    it( "check for tablesaw1", function( done ) {
        doScenario( scenarios[0], done );
    });

    it("check for tablesaw2", function( done ){
        doScenario( scenarios[1], done );
    });

});
