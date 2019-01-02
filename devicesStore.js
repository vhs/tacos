"use strict";

var Promise = require('bluebird'),
    _ = require('underscore'),
	debug = require('debug')('atoms:deviceStore'),
	getLine = require('./lib/utils').getLine,
	config = require('./config'),
	EventEmitter = require('events').EventEmitter,
    emitter = new EventEmitter(),
	loki = require( 'lokijs' ),
	deviceDB = new loki( 'shared/devicesStore.json' );

var devices = {};
	
deviceDB.loadDatabase( {}, function() {
	debug( getLine(), "Loading database..." );
	debug( getLine(), "Loading devices collection..." );
	devices = deviceDB.getCollection( 'devices' );
	if( devices === null ) {
		debug( getLine(), "Collection not found!" );
		debug( getLine(), "Adding collection!" );
		devices = deviceDB.addCollection( 'devices', { indices: ['id'], autoupdate: true } );
	}
});

setInterval( function() {
	debug( getLine(), "Autosaving" );
	deviceDB.saveDatabase();
}, 10000 );

var getAllDevices = function() {
	return devices.find({'id': { '$ne' : '' }});
};

module.exports.getAllDevices = getAllDevices;

var getAvailableDevices = function( user ) {
	var devices_list = {};
	
	getAllDevices().forEach( function( device ) {
		if( checkDeviceAccess( device.id, user ) )
			devices_list[device.id] = device;
	});
	
	return devices_list;
};

module.exports.getAvailableDevices = getAvailableDevices;

var registerDevice = function( device_id ) {
	var deviceResult = devices.findOne( { 'id': device_id } );
	
	if( deviceResult === null ) {
		deviceResult = {
			"id" : device_id,
			"description" : device_id,
			"role" : config.default_role,
			"powered" : 0,
			"hassecret" : 0,
			"secret" : ""
		};
		
		deviceResult = devices.insert( deviceResult );
	}
	
	deviceResult.last_seen = Date.now();
	
	devices.update( deviceResult );
	
	return deviceResult;
};

module.exports.registerDevice = registerDevice;

var updateDeviceDescription = function( device_id, description ) {
	var deviceResult = devices.findOne( { 'id': device_id } );
	
	deviceResult.description = description;
	
	return getDeviceDetails( device_id );
};

module.exports.updateDeviceDescription = updateDeviceDescription;

var updateDeviceRole = function( device_id, role ) {
	var deviceResult = devices.findOne( { 'id': device_id } );
	
	deviceResult.role = role;
	
	return getDeviceDetails( device_id );
};

module.exports.updateDeviceRole = updateDeviceRole;

var deleteDeviceSecret = function( device_id, secret ) {
	var deviceResult = devices.findOne( { 'id': device_id } );

	deviceResult.secret = null;
	
	return getDeviceDetails( device_id );
};

module.exports.deleteDeviceSecret = deleteDeviceSecret;

var updateDeviceHasSecret = function( device_id, hasSecret ) {
	var deviceResult = devices.findOne( { 'id': device_id } );

	deviceResult.hasSecret = hasSecret;
	
	return getDeviceDetails( device_id );
};

module.exports.updateDeviceHasSecret = updateDeviceHasSecret;

var updateDeviceSecret = function( device_id, secret ) {
	var deviceResult = devices.findOne( { 'id': device_id } );

	deviceResult.secret = secret;
	
	return getDeviceDetails( device_id );
};

module.exports.updateDeviceSecret = updateDeviceSecret;

var armDevice = function( device_id ) {
	var deviceResult = devices.findOne( { 'id': device_id } );

	if( deviceResult === null )
		return false;
	
	deviceResult.powered = 1;
	deviceResult.activation_expiry = ( Date.now() + parseInt( config.activation_timeout ) );
	
	var result = {};
	result.id = deviceResult.id;
	result.powered = deviceResult.powered;
	
	debug( getLine(), "Armed device: ", device_id );
	
	return getDeviceDetails( device_id );
};

module.exports.armDevice = armDevice;

var unarmDevice = function( device_id ) {
	var deviceResult = devices.findOne( { 'id': device_id } );

	if( deviceResult === null )
		return { "error" : "No such device" };
	
	deviceResult.powered = 0;
	
	return getDeviceDetails( device_id );
};

module.exports.unarmDevice = unarmDevice;

var getDeviceList = function() {
	return getAllDevices();
};

module.exports.getDeviceList = getDeviceList;

var getDeviceRole = function( device_id ) {
	var deviceResult = registerDevice( device_id );
	
	return deviceResult.role;
};

module.exports.getDeviceRole = getDeviceRole;

var getDeviceState = function( device_id ) {
	var deviceResult = registerDevice( device_id );

	var result = {};
	result.success = true;
	result.id = deviceResult.id;
	result.state = {};
	result.state.powered = deviceResult.powered;
	
	if( ( deviceResult.activation_expiry < Date.now() ) ) {
		result.state.powered = deviceResult.powered = 0;
	}
	
	return result;
};

module.exports.getDeviceState = getDeviceState;

var getDeviceDetails = function( device_id ) {
	var deviceResult = devices.findOne( { 'id': device_id } );

	if( deviceResult === null )
		return { "error" : "No such device" };
	
	var result = {};
	result.success = true;
	result.id = deviceResult.id;
	result.last_seen = deviceResult.last_seen;
	result.state = {};
	result.state.powered = deviceResult.powered;
	
	if( ( deviceResult.activation_expiry < Date.now() ) ) {
		result.state.powered = deviceResult.powered = 0;
	}
	
	return result;
};

module.exports.getDeviceDetails = getDeviceDetails;

var deleteDevice = function( device_id ) {
	var deviceResult = devices.chain().find( { 'id': { '$eq' : device_id } } ).remove().data();

	if( deviceResult.length === 0 )
		return true;
	
	return false;
};

module.exports.deleteDevice = deleteDevice;

var checkDeviceExists = function( device_id ) {
	var deviceResult = devices.findOne( { 'id': device_id } );

	if( deviceResult !== null )
		return true;
	
	return false;
};

module.exports.checkDeviceExists = checkDeviceExists;

var checkDeviceAccess = function( device_id, user ) {
  debug( getLine(), user );
  
	if( user.administrator )
		return true;

	var deviceResult = devices.findOne( { 'id': device_id } );

	if( user.privileges.indexOf( deviceResult.role ) >= 0 )
		return true;

	return false;
};

module.exports.checkDeviceAccess = checkDeviceAccess;
