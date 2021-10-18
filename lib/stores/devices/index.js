'use strict'

const path = require('path')

const debug = require('debug')('tacos:lib:stores:devices')
const { config } = require('../../config/')
const Loki = require('lokijs')

const DeviceStore = function (dataDir) {
  this.deviceDB = new Loki(path.resolve(dataDir, 'devicesStore.json'))
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
  const devices = this.devices.find({
    id: { $ne: '' },
    // @ts-ignore
    activation_expiry: { $lt: Date.now() }
  })

  for (const idx in devices) {
    const deviceResult = this.devices.findOne({ id: devices[idx].id })

    if (deviceResult.activation_expiry < Date.now() && deviceResult.armed === 1) {
      debug('automaticDisarm', 'device', deviceResult.id)
      deviceResult.armed = 0
    }
  }
}

DeviceStore.prototype.getAllDevices = function () {
  return this.devices.find({ id: { $ne: '' } })
}

DeviceStore.prototype.getAvailableDevices = function (user) {
  const devicesList = []

  this.getAllDevices().forEach((device) => {
    if (this.checkDeviceAccess(device.id, user) === true) { devicesList.push(device) }
  })

  return devicesList
}

DeviceStore.prototype.registerDevice = function (deviceId) {
  let deviceResult = this.devices.findOne({ id: deviceId })

  if (deviceResult === null) {
    deviceResult = {
      id: deviceId,
      description: deviceId,
      role: config.default_role,
      armed: 0
    }

    deviceResult = this.devices.insert(deviceResult)

    deviceResult = this.devices.findOne({ id: deviceId })
  }

  deviceResult.last_seen = Date.now()

  this.devices.update(deviceResult)

  return deviceResult
}

DeviceStore.prototype.updateDeviceDescription = function (
  deviceId,
  description
) {
  const deviceResult = this.devices.findOne({ id: deviceId })

  deviceResult.description = description

  return this.getDeviceDetails(deviceId)
}

DeviceStore.prototype.updateDeviceRole = function (deviceId, role) {
  const deviceResult = this.devices.findOne({ id: deviceId })

  deviceResult.role = role

  return this.getDeviceDetails(deviceId)
}

DeviceStore.prototype.armDevice = function (deviceId) {
  const deviceResult = this.devices.findOne({ id: deviceId })

  if (deviceResult === null) return { error: 'No such device' }

  deviceResult.armed = 1
  deviceResult.activation_expiry = Date.now() + parseInt(config.activation_timeout)

  return this.getDeviceDetails(deviceId)
}

DeviceStore.prototype.unarmDevice = function (deviceId) {
  const deviceResult = this.devices.findOne({ id: deviceId })

  if (deviceResult === null) return { error: 'No such device' }

  deviceResult.armed = 0

  return this.getDeviceDetails(deviceId)
}

DeviceStore.prototype.getDeviceList = function () {
  return this.getAllDevices()
}

DeviceStore.prototype.getDeviceState = function (deviceId) {
  const deviceResult = this.registerDevice(deviceId)

  const result = {}
  result.success = true
  result.id = deviceResult.id
  result.armed = deviceResult.armed
  result.role = deviceResult.role
  result.state = {}
  result.state.armed = deviceResult.armed

  return result
}

DeviceStore.prototype.getDeviceDetails = function (deviceId) {
  const deviceResult = this.devices.findOne({ id: deviceId })

  if (deviceResult === null) return { error: 'No such device' }

  const result = {}
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

DeviceStore.prototype.getDeviceRole = function (deviceId) {
  const deviceResult = this.registerDevice(deviceId)

  const result = {}
  result.success = true
  result.id = deviceResult.id
  result.role = deviceResult.role
  result.armed = deviceResult.armed

  return result
}

DeviceStore.prototype.deleteDevice = function (deviceId) {
  const deviceResult = this.devices
    .chain()
    .find({ id: { $eq: deviceId } })
    .remove()
    .data()

  if (deviceResult.length === 0) return true

  return false
}

DeviceStore.prototype.checkDeviceExists = function (deviceId) {
  const deviceResult = this.devices.findOne({ id: deviceId })

  if (deviceResult !== null) return true

  return false
}

DeviceStore.prototype.checkDeviceAccess = function (deviceId, user) {
  const deviceResult = this.devices.findOne({ id: deviceId })

  if (user.administrator === true) return true

  if (user.privileges.indexOf(deviceResult.role) >= 0) return true

  return false
}

let deviceStore = null

const getInstance = function (dataDir) {
  if (deviceStore === null) deviceStore = new DeviceStore(dataDir)

  return deviceStore
}

module.exports = getInstance
