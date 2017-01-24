"use strict";

var Promise = require('bluebird'),
	debug = require('debug')('app:device'),
	config = require('./config'),
	EventEmitter = require('events').EventEmitter,
    emitter = new EventEmitter();
	// devicesDB = require('level')('./devicedb');

var devices = {};

try {
	devices = require('./devices_store');
} catch( e ) {
	console.log( "No devices registry file available" );
	// console.log(e)
}

module.exports.devices = devices;

var getAllDevices = function() {
	return devices;
}

module.exports.getAllDevices = getAllDevices;

var getAvailableDevices = function( user_roles ) {
	
	var devices_list = {};
	
	devices.forEach( function( device, device_key ) {
		if( user_roles[device.role] !== undefined )
			devices_list[device_key] = device;
	});
	
	return devices_list;
}

module.exports.getAvailableDevices = getAvailableDevices;

var saveDevices = function() {
	var fs = require('fs');
	fs.writeFile( 'devices_store.json', JSON.stringify( devices, null, 4 ) );
}

var autoSave = true;

if( autoSave ) {
	setInterval( saveDevices, 60000 );
}

var registerDevice = function( device_id ) {
		
	if( ! (device_id in devices) ) {
		devices[device_id] = {
			"id" : device_id,
			"description" : device_id,
			"role" : config.default_role,
			"powered" : 0
		};
	}
	
	devices[device_id].last_seen = Date.now();

}

module.exports.registerDevice = registerDevice;

var updateDeviceDescription = function( device_id, description ) {
	devices[device_id].description = description;
	
	if( ! autoSave ) saveDevices();
	
	return getDeviceDetails( device_id );
}

module.exports.updateDeviceDescription = updateDeviceDescription;

var updateDeviceRole = function( device_id, role ) {
	devices[device_id].role = role;
	
	if( ! autoSave ) saveDevices();
	
	return getDeviceDetails( device_id );
}

module.exports.updateDeviceRole = updateDeviceRole;

var armDevice = function( device_id ) {
	if( devices[device_id] == undefined )
		return result = { "error" : "No such device" };
	
	devices[device_id].powered = 1;
	devices[device_id].activation_expiry = ( Date.now() + parseInt( config.activation_timeout ) );
	
	var result = {};
	result.id = devices[device_id].id;
	result.powered = devices[device_id].powered;
	
	if( ! autoSave ) saveDevices();
	
	return result;
};

module.exports.armDevice = armDevice;

var unarmDevice = function( device_id ) {
	if( devices[device_id] == undefined )
		return result = { "error" : "No such device" };
	
	devices[device_id].powered = 0;
	
	var result = {};
	result.id = devices[device_id].id;
	result.powered = devices[device_id].powered;
	
	if( ! autoSave ) saveDevices();
	
	return result;
};

module.exports.unarmDevice = unarmDevice;

var getDeviceList = function() {
	return devices;
};

module.exports.getDeviceList = getDeviceList;

var getDeviceState = function( device_id ) {
	registerDevice( device_id );

	var result = {};
	result.success = true;
	result.id = devices[device_id].id;
	result.state = {};
	result.state.powered = devices[device_id].powered;
	
	if( ( devices[device_id].activation_expiry < Date.now() ) ) {
		result.state.powered = devices[device_id].powered = 0;
		if( ! autoSave ) saveDevices();
	}
	
	return result;
};

module.exports.getDeviceState = getDeviceState;

var getDeviceDetails = function( device_id ) {

	var result = {};
	result.success = true;
	result.id = devices[device_id].id;
	result.last_seen = devices[device_id].last_seen;
	result.powered = devices[device_id].powered;
	
	return result;
};

module.exports.getDeviceDetails = getDeviceDetails;

var checkDeviceExists = function( device_id ) {
	if( devices[device_id] !== undefined )
		return true;
	
	return false;
}

module.exports.checkDeviceExists = checkDeviceExists;

var checkDeviceAccess = function( device_id, user_roles ) {
	if( user_roles[devices[device_id].role] !== undefined )
		return true;
	
	return false;
};

module.exports.checkDeviceAccess = checkDeviceAccess;