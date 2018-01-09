"use strict";

var config = require("./config");
var CryptoJS = require("crypto-js");
var randomstring = require("randomstring");
var request = require('request-promise');
var Packeteer = require('./packeteer');
var debug = require('debug')('test:devices-state');
var getLine = require('../utils').getLine;

var devicesStore = require('../devicesStore');


describe('Device Store tests', function(){

    it( "gets all the devices", function( done ) {
    	return devicesStore.getAllDevices();
    });
    
  it("get available devices for an anonymous user", function( done ){
  	devicesStore.getAvailableDevices( {} );
  });
        
  it("get available devices for an anonymous user", function( done ){
    devicesStore.getAvailableDevices( { } );
  });
    
//    getAvailableDevices
//    registerDevice
//    updateDeviceDescription
//    updateDeviceRole
//    deleteDeviceSecret
//    updateDeviceHasSecret
//    updateDeviceSecret
//    armDevice
//    unarmDevice
//    getDeviceList
//    getDeviceRole
//    getDeviceState
//    getDeviceDetails
//    deleteDevice
//    checkDeviceExists
//    checkDeviceAccess

});
