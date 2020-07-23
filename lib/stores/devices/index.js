"use strict"

const path = require('path')

const _ = require('underscore')
const debug = require('debug')('tacos:lib:stores:devices')
const { config } = require('../../config/')
const { EventEmitter } = require('events')
const loki = require('lokijs')

const emitter = new EventEmitter()

var DeviceStore = function (dataDir, options) {
	options = options || { persistence: true }

	this.deviceDB = new loki(path.resolve(dataDir, 'devicesStore.json'))
	this.deviceDB.loadDatabase(
		{},
		() => {
			debug("Loading database...")
			debug("Loading devices collection...")
			this.devices = this.deviceDB.getCollection('devices')
			if (this.devices == null) {
				debug("Collection not found!")
				debug("Adding collection!")
				this.devices = this.deviceDB.addCollection(
					'devices',
					{
						indices: ['id'],
						autoupdate: true
					}
				)
			}
		}
	)

	if (options.persistence === true && options.save_interval > 0)
		setInterval(() => {
			debug("Autosaving")
			this.deviceDB.saveDatabase()
		}, options.save_interval)
}

DeviceStore.prototype.getAllDevices = function () {
	return this.devices.find({ 'id': { '$ne': '' } })
}

DeviceStore.prototype.getAvailableDevices = function (user) {
	var devices_list = {}

	this.getAllDevices().forEach((device) => {
		if (this.checkDeviceAccess(device.id, user))
			devices_list[device.id] = device
	})

	return devices_list
}

DeviceStore.prototype.registerDevice = function (device_id) {
	var deviceResult = this.devices.findOne({ 'id': device_id })

	if (deviceResult === null) {
		deviceResult = {
			"id": device_id,
			"description": device_id,
			"role": config.default_role,
			"powered": 0
		}

		var deviceResult = this.devices.insert(deviceResult)

		deviceResult = this.devices.findOne({ 'id': device_id })
	}

	deviceResult.last_seen = Date.now()

	this.devices.update(deviceResult)

	return deviceResult
}

DeviceStore.prototype.updateDeviceDescription = function (device_id, description) {
	var deviceResult = this.devices.findOne({ 'id': device_id })

	deviceResult.description = description

	return this.getDeviceDetails(device_id)
}

DeviceStore.prototype.updateDeviceRole = function (device_id, role) {
	var deviceResult = this.devices.findOne({ 'id': device_id })

	deviceResult.role = role

	return this.getDeviceDetails(device_id)
}

DeviceStore.prototype.armDevice = function (device_id) {
	var deviceResult = this.devices.findOne({ 'id': device_id })

	if (deviceResult === null)
		return result = { "error": "No such device" }

	deviceResult.powered = 1
	deviceResult.activation_expiry = (Date.now() + parseInt(config.activation_timeout))

	var result = {}
	result.id = deviceResult.id
	result.powered = deviceResult.powered

	return this.getDeviceDetails(device_id)
}

DeviceStore.prototype.unarmDevice = function (device_id) {
	var deviceResult = this.devices.findOne({ 'id': device_id })

	if (deviceResult === null)
		return result = { "error": "No such device" }

	deviceResult.powered = 0

	return this.getDeviceDetails(device_id)
}

DeviceStore.prototype.getDeviceList = function () {
	return this.getAllDevices()
}

DeviceStore.prototype.getDeviceState = function (device_id) {
	var deviceResult = this.registerDevice(device_id)

	var result = {}
	result.success = true
	result.id = deviceResult.id
	result.powered = deviceResult.powered
	result.role = deviceResult.role
	result.state = {}
	result.state.powered = deviceResult.powered

	if ((deviceResult.activation_expiry < Date.now())) {
		result.state.powered = deviceResult.powered = 0
	}

	return result
}

DeviceStore.prototype.getDeviceDetails = function (device_id) {
	var deviceResult = this.devices.findOne({ 'id': device_id })

	if (deviceResult === null)
		return result = { "error": "No such device" }

	var result = {}
	result.success = true
	result.id = deviceResult.id
	result.last_seen = deviceResult.last_seen
	result.description = deviceResult.description
	result.role = deviceResult.role
	result.powered = deviceResult.powered
	result.state = {}
	result.state.powered = deviceResult.powered

	if ((deviceResult.activation_expiry < Date.now())) {
		result.state.powered = deviceResult.powered = 0
	}

	return result
}

DeviceStore.prototype.getDeviceRole = function (device_id) {
	var deviceResult = this.registerDevice(device_id)

	var result = {}
	result.success = true
	result.id = deviceResult.id
	result.role = deviceResult.role
	result.powered = deviceResult.powered

	if ((deviceResult.activation_expiry < Date.now())) {
		result.powered = deviceResult.powered = 0
	}

	return result
}

DeviceStore.prototype.deleteDevice = function (device_id) {
	var deviceResult = this.devices.chain().find({ 'id': { '$eq': device_id } }).remove().data()

	if (deviceResult.length == 0)
		return true

	return false
}


DeviceStore.prototype.checkDeviceExists = function (device_id) {
	var deviceResult = this.devices.findOne({ 'id': device_id })

	if (deviceResult !== null)
		return true

	return false
}


DeviceStore.prototype.checkDeviceAccess = function (device_id, user) {
	if (user.administrator === true)
		return true

	var deviceResult = this.devices.findOne({ 'id': device_id })

	if (user.privileges.indexOf(deviceResult.role) >= 0)
		return true

	return false
}

var deviceStore = null

const getInstance = function (dataDir, options) {
	if (deviceStore === null)
		deviceStore = new DeviceStore(dataDir, options)

	return deviceStore
}

module.exports = getInstance
