'use strict'

const path = require('path')

const _ = require('underscore')
const debug = require('debug')('tacos:lib:stores:devices')
const { config } = require('../../config/')
const { EventEmitter } = require('events')
const loki = require('lokijs')

const emitter = new EventEmitter()

var DeviceStore = function (dataDir) {
	this.deviceDB = new loki(path.resolve(dataDir, 'devicesStore.json'))
	this.deviceDB.loadDatabase({}, () => {
		debug('Loading database...')
		debug('Loading devices collection...')
		this.devices = this.deviceDB.getCollection('devices')
		if (this.devices == null) {
			debug('Collection not found!')
			debug('Adding collection!')
			this.devices = this.deviceDB.addCollection('devices', {
				indices: ['id'],
				autoupdate: true
			})
		}
	})

	setInterval(() => {
		debug('Autosaving')
		this.deviceDB.saveDatabase()
	}, 10000)

	setInterval(() => {
		debug('Autodisarming')
		this.automaticDisarm()
	}, 5000)
}

DeviceStore.prototype.automaticDisarm = function () {
	let devices = this.devices.find({
		id: { $ne: '' },
		activation_expiry: { $lt: Date.now() }
	})

	for (let idx in devices) {
		let deviceResult = this.devices.findOne({ id: devices[idx].id })

		if (
			deviceResult.activation_expiry < Date.now() &&
			deviceResult.armed === 1
		) {
			debug('automaticDisarm', 'device', deviceResult.id)
			deviceResult.armed = 0
		}
	}
}

DeviceStore.prototype.getAllDevices = function () {
	return this.devices.find({ id: { $ne: '' } })
}

DeviceStore.prototype.getAvailableDevices = function (user) {
	var devices_list = []

	this.getAllDevices().forEach((device) => {
		if (this.checkDeviceAccess(device.id, user) === true)
			devices_list.push(device)
	})

	return devices_list
}

DeviceStore.prototype.registerDevice = function (device_id) {
	var deviceResult = this.devices.findOne({ id: device_id })

	if (deviceResult === null) {
		deviceResult = {
			id: device_id,
			description: device_id,
			role: config.default_role,
			armed: 0
		}

		var deviceResult = this.devices.insert(deviceResult)

		deviceResult = this.devices.findOne({ id: device_id })
	}

	deviceResult.last_seen = Date.now()

	this.devices.update(deviceResult)

	return deviceResult
}

DeviceStore.prototype.updateDeviceDescription = function (
	device_id,
	description
) {
	var deviceResult = this.devices.findOne({ id: device_id })

	deviceResult.description = description

	return this.getDeviceDetails(device_id)
}

DeviceStore.prototype.updateDeviceRole = function (device_id, role) {
	var deviceResult = this.devices.findOne({ id: device_id })

	deviceResult.role = role

	return this.getDeviceDetails(device_id)
}

DeviceStore.prototype.armDevice = function (device_id) {
	var deviceResult = this.devices.findOne({ id: device_id })

	if (deviceResult === null) return (result = { error: 'No such device' })

	deviceResult.armed = 1
	deviceResult.activation_expiry =
		Date.now() + parseInt(config.activation_timeout)

	var result = {}
	result.id = deviceResult.id
	result.armed = deviceResult.armed

	return this.getDeviceDetails(device_id)
}

DeviceStore.prototype.unarmDevice = function (device_id) {
	var deviceResult = this.devices.findOne({ id: device_id })

	if (deviceResult === null) return (result = { error: 'No such device' })

	deviceResult.armed = 0

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
	result.armed = deviceResult.armed
	result.role = deviceResult.role
	result.state = {}
	result.state.armed = deviceResult.armed

	return result
}

DeviceStore.prototype.getDeviceDetails = function (device_id) {
	var deviceResult = this.devices.findOne({ id: device_id })

	if (deviceResult === null) return (result = { error: 'No such device' })

	var result = {}
	result.success = true
	result.id = deviceResult.id
	result.last_seen = deviceResult.last_seen
	result.description = deviceResult.description
	result.role = deviceResult.role
	result.armed = deviceResult.armed
	result.state = {}
	result.state.armed = deviceResult.armed

	return result
}

DeviceStore.prototype.getDeviceRole = function (device_id) {
	var deviceResult = this.registerDevice(device_id)

	var result = {}
	result.success = true
	result.id = deviceResult.id
	result.role = deviceResult.role
	result.armed = deviceResult.armed

	return result
}

DeviceStore.prototype.deleteDevice = function (device_id) {
	var deviceResult = this.devices
		.chain()
		.find({ id: { $eq: device_id } })
		.remove()
		.data()

	if (deviceResult.length == 0) return true

	return false
}

DeviceStore.prototype.checkDeviceExists = function (device_id) {
	var deviceResult = this.devices.findOne({ id: device_id })

	if (deviceResult !== null) return true

	return false
}

DeviceStore.prototype.checkDeviceAccess = function (device_id, user) {
	var deviceResult = this.devices.findOne({ id: device_id })

	if (user.administrator === true) return true

	if (user.privileges.indexOf(deviceResult.role) >= 0) return true

	return false
}

var deviceStore = null

const getInstance = function (dataDir) {
	if (deviceStore === null) deviceStore = new DeviceStore(dataDir)

	return deviceStore
}

module.exports = getInstance
