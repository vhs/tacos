'use strict'

var express = require('express')
var { config } = require('../../../lib/config')
var debug = require('debug')('tacos:middleware:devices:lib')
var { getLine } = require('../../../lib/utils')
var { deviceStore, loggingStore } = require('../../../lib/stores')
var router = express.Router()

const Logger = loggingStore.getLogger('tacos:middleware:devices:lib')

var setResultArray = function (req, res, next) {
  res.result = {}

  next()
}

var requireValidDevice = function (req, res, next) {
  var deviceId = req.params.id

  if (deviceId === undefined || !deviceStore.checkDeviceExists(deviceId)) {
    res.result = {
      message: 'Missing device'
    }
    next('route')
  }
}

var requireToolAccess = function (req, res, next) {
  var deviceId = req.params.id

  if (deviceId === undefined) {
    res.result = {
      message: 'Missing device'
    }
    next('route')
  }

  if (req.user && deviceStore.checkDeviceAccess(deviceId, req.user)) {
    return next()
  }

  next({
    statusCode: 401,
    message: 'Access Denied'
  })
}

function getDevices(req, res, next) {
  if (req.user === undefined) {
    res.result.result = 'ERROR'
    res.result.message = 'error: missing user information'
    next()
  }

  if (req.user.administrator !== undefined && req.user.administrator === true) {
    res.result = deviceStore.getAllDevices();
  } else {
    res.result = deviceStore.getAvailableDevices(req.user);
  }

  next('route')
}


var getDeviceState = function (req, res, next) {
  if (!req.params.id) {
    res.result.message = 'error: missing device id'
    next()
  }

  var deviceId = req.params.id

  res.result = deviceStore.getDeviceState(deviceId)

  next()
}

var getDeviceDetails = function (req, res, next) {
  if (!req.params.id) {
    res.result.message = 'error: missing device id'
    next()
  }

  var deviceId = req.params.id

  res.result = deviceStore.getDeviceDetails(deviceId)

  next()
}

var deleteDevice = function (req, res, next) {
  Logger.info({ action: 'deleteDevice', 'user': req.user.username, device: req.params.id, message: 'user ' + req.user.username + ' deleted device: ' + req.params.id })

  if (!req.params.id) {
    res.result.message = 'error: missing device id'
    next()
  }

  var deviceId = req.params.id

  res.result = {}

  if (deviceStore.deleteDevice(deviceId)) {
    res.result = {
      result: 'ok'
    }
  }

  next()
}

var updateDeviceRole = function (req, res, next) {
  Logger.info({ action: 'updateDeviceRole', 'user': req.user.username, device: req.params.id, message: 'user ' + req.user.username + ' updated device role: ' + req.params.id })

  if (!req.params.id) {
    res.result.message = 'error: missing role id'
    next()
  }

  var deviceId = req.params.id
  var role = req.body.role

  res.result = deviceStore.updateDeviceRole(deviceId, role)

  next()
}

var updateDeviceDescription = function (req, res, next) {
  Logger.info({ action: 'updateDeviceDescription', 'user': req.user.username, device: req.params.id, message: 'user ' + req.user.username + ' updated description device: ' + req.params.id })

  debug('updateDeviceDescription', 'req.params:', req.params)
  debug('updateDeviceDescription', 'req.body:', req.body)

  if (!req.params.id || req.params.id === 0) {
    res.result.message = 'error: missing device id'
    next('route')
  }

  var deviceId = req.params.id
  var description = req.body.description

  debug('updateDeviceDescription', 'description:', description)

  res.result = deviceStore.updateDeviceDescription(deviceId, description)

  next()
}

var updateDeviceHasSecret = function (req, res, next) {
  Logger.info({ action: 'updateDeviceHasSecret', 'user': req.user.username, device: req.params.id, message: 'user ' + req.user.username + ' update device has secret: ' + req.params.id })

  if (!req.params.id || req.params.id === 0) {
    res.result.message = 'error: missing device id'
    next('route')
  }

  var deviceId = req.params.id
  var hasSecret = req.body.hasSecret

  res.result = deviceStore.updateDeviceHasSecret(deviceId, hasSecret)

  next()
}

var updateDeviceSecret = function (req, res, next) {
  Logger.info({ action: 'updateDeviceHasSecret', 'user': req.user.username, device: req.params.id, message: 'user ' + req.user.username + ' update device secret: ' + req.params.id })

  if (!req.params.id || req.params.id === 0) {
    res.result.message = 'error: missing device id'
    next('route')
  }

  var deviceId = req.params.id
  var secret = req.body.secret

  res.result = deviceStore.updateDeviceSecret(deviceId, secret)

  next()
}

var armDevice = function (req, res, next) {
  Logger.info({ action: 'armDevice', 'user': req.user.username, device: req.params.id, message: 'user ' + req.user.username + ' armed device: ' + req.params.id })

  if (!req.params.id) {
    res.result.message = 'error: missing device id'
    next()
  }

  var deviceId = req.params.id

  res.result = deviceStore.armDevice(deviceId)

  next()
}

var unarmDevice = function (req, res, next) {
  Logger.info({ action: 'unarmDevice', 'user': req.user.username, device: req.params.id, message: 'user ' + req.user.username + ' unarmed device: ' + req.params.id })

  if (!req.params.id) {
    res.result.message = 'error: missing device id'
    next()
  }

  var deviceId = req.params.id

  res.result = deviceStore.unarmDevice(deviceId)

  next()
}

// Export the router
module.exports = { setResultArray, requireValidDevice, requireToolAccess, getDevices, getDeviceState, getDeviceDetails, deleteDevice, updateDeviceRole, updateDeviceDescription, updateDeviceHasSecret, updateDeviceSecret, armDevice, unarmDevice }
