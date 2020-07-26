'use strict'

var express = require('express')
var debug = require('debug')('tacos:middleware:terminals:lib')
var { config } = require('../../../lib/config')

var { getLine } = require('../../../lib/utils')
var { deviceStore, loggingStore, terminalStore } = require('../../../lib/stores/')

var { backend } = require('../../../lib/backend')

const Logger = loggingStore.getLogger('tacos:middleware:terminals:lib')

var getAllTerminals = function (req, res, next) {
  debug(getLine(), 'getAllTerminals')

  res.locals.terminals = terminalStore.getAllTerminals()
  res.send(terminalStore.getAllTerminals())
  // next()
}

// Default get result
var handleDefaultRequest = function (req, res, next) {
  debug(getLine(), 'handleDefaultRequest')

  res.locals.user = req.user
  req.session.touch()
  res.locals.terminals = terminalStore.getAllTerminals()
  debug(getLine(), 'res.locals.terminals', res.locals.terminals)
  res.send(res.local.terminals)
}

// Set result array
var setDefaultResultArray = function (req, res, next) {
  debug(getLine(), 'setDefaultResultArray')

  res.result = {
    result: 'ERROR'
  }

  if (typeof req.body !== 'object') {
    req.body = JSON.parse(req.body)
  }

  next()
}

// Query state
var processTerminalPing = function (req, res, next) {
  debug(getLine(), 'processTerminalPing')

  if (req.body.data.ping === undefined) {
    res.result.message = 'error: missing ping message'
  } else {
    res.result.result = 'OK'
    res.result.pong = req.body.data.ping
  }

  next()
}

// Query state
var getTerminalState = function (req, res, next) {
  debug(getLine(), 'getTerminalState')

  if (!req.params.id) {
    res.result.message = 'error: missing terminal id'
    next()
  }

  if (typeof req.body !== 'object') {
    req.body = JSON.parse(req.body)
  }

  var terminalId = req.params.id

  res.result = terminalStore.getTerminalState(terminalId)
  res.result.timestamp = Math.floor(Date.now() / 1000)

  next()
}

// Query state
var getTerminalDetails = function (req, res, next) {
  debug(getLine(), 'getTerminalDetails')

  if (!req.params.id) {
    res.result.message = 'error: missing terminal id'
    next()
  }

  var terminalId = req.params.id

  res.result = terminalStore.getTerminalDetails(terminalId)

  debug(getLine(), 'getTerminalDetails', res.result)

  next()
}

var verifyTerminal = function (req, res, next) {
  debug(getLine(), 'verifyTerminal')

  debug(getLine(), 'verifyTerminal: [' + req.params.id + ']')

  // Check terminalId
  if (!req.params.id) {
    res.result.message = 'error: missing terminal id'
    res.status(403)
    next('route')
  } else if (!terminalStore.checkTerminalExists(req.params.id)) {
    res.result.message = 'error: no such terminal '
    res.status(403)
    next('route')
  } else {
    next()
  }
}

var verifyTerminalEnabled = function (req, res, next) {
  debug(getLine(), 'verifyTerminalEnabled')

  if (!terminalStore.checkTerminalEnabled(req.params.id)) {
    res.result.message = 'error: terminal is not enabled'
    debug(getLine(), 'verifyTerminalEnabled', res.result.message)
    res.status(403).send(JSON.stringify(res.result))
  } else if (!terminalStore.checkTerminalHasTarget(req.params.id)) {
    res.result.message = "error: terminal doesn't have a target"
    debug(getLine(), 'verifyTerminalEnabled', res.result.message)
    res.status(403).send(JSON.stringify(res.result))
  } else {
    next()
  }
}

var verifyHMAC = function (req, res, next) {
  debug(getLine(), 'verifyHMAC')

  var terminalId = req.params.id

  if (!terminalStore.checkTerminalSecured(terminalId)) {
    res.result.message = 'error: missing secret'
    res.status(403).send(JSON.stringify(res.result))
  } else if (req.body.data === undefined || req.body.hash === undefined) {
    debug(getLine(), 'verifyHMAC', 'req.params', req.params)
    debug(getLine(), 'verifyHMAC', 'req.body', req.body)
    res.result.message = 'error: incorrect message format, missing authentication data'
    res.send(JSON.stringify(res.result))
  } else if (!req.body.data.nonce || !req.body.data.ts || !req.body.hash) {
    res.result.message = 'error: missing auth data'
    res.status(403).send(JSON.stringify(res.result))
  } else {
    debug(getLine(), 'Checking HMAC')
    // Packet looks good and terminal has secret, check HMAC
    var packet = req.body

    if (!terminalStore.verifyHMAC(terminalId, packet)) {
      res.result.message = 'error: HMAC verification failed'
      res.status(403).send(JSON.stringify(res.result))
    } else {
      next()
    }
  }
}

var authenticateRFIDCard = function (req, res, next) {
  debug(getLine(), 'authenticateRFIDCard')

  // Check input

  // Check message data
  if (!req.body.data && !req.body.data.cardId) {
    res.result.message = 'error: missing card id'
    next('route')
  }

  var terminalId = req.params.id
  var cardId = req.body.data.card_id

  debug(getLine(), 'authenticateRFIDCard', 'terminalId', terminalId)
  debug(getLine(), 'authenticateRFIDCard', 'req.body', req.body)

  // Get target
  var terminalTarget = terminalStore.getTerminalTarget(terminalId)
  // Get target role
  var deviceRole = deviceStore.getDeviceRole(terminalTarget)
  debug(getLine(), 'authenticateRFIDCard', 'deviceRole', deviceRole)

  // Check user privilege for role
  var cardRequest = {}
  cardRequest.id = cardId

  debug(getLine(), 'authenticateRFIDCard', 'cardRequest', cardRequest)

  backend.checkCard(cardRequest)
    .then(function (done) {
      if (!cardRequest.valid) {
        console.log(Date.now() + ': RFID ACCESS DENIED for ' + cardRequest.id)
        res.result.message = 'ACCESS DENIED: invalid card id'
        next('route')
      } else {
        // Check role against received privileges
        if (cardRequest.administrator || cardRequest.privileges.indexOf(deviceRole) >= 0) {
          console.log(Date.now() + ': RFID ACCESS PERMITTED for ' + cardRequest.id + ' - ' + cardRequest.username)

          // Arm device
          var armResult = deviceStore.armDevice(terminalTarget)
          if (!armResult) {
            res.result.message = 'Failed to arm device'
          } else {
            res.result.message = 'ACCESS GRANTED - Device armed'
            res.result.result = 'OK'
          }
        } else {
          console.log(Date.now() + ': RFID ACCESS DENIED for ' + cardRequest.id + ' - ' + cardRequest.username)
          res.result.message = 'ACCESS DENIED'
        }
        next('route')
      }
    })
}

// Enable terminal
var updateTerminalDescription = function (req, res, next) {
  Logger.info({ action: 'updateTerminalDescription', 'user': req.user.username, device: req.params.id, message: 'user ' + req.user.username + ' update terminal description device: ' + req.params.id })

  debug(getLine(), 'updateTerminalDescription')

  if (!req.params.id) {
    res.result.message = 'error: missing terminal id'
    debug(res.result.message)
    next()
  } else if (req.body.description === undefined) {
    res.result.message = 'error: missing description'
    debug(res.result.message)
    next()
  } else {
    var terminalId = req.params.id

    var description = req.body.description

    res.result = terminalStore.updateTerminalDescription(terminalId, description)

    next()
  }
}

// Enable terminal
var updateTerminalEnabled = function (req, res, next) {
  Logger.info({ action: 'updateTerminalEnabled', 'user': req.user.username, device: req.params.id, message: 'user ' + req.user.username + ' update terminal enabled device: ' + req.params.id })

  debug(getLine(), 'updateTerminalEnabled')

  if (!req.params.id) {
    res.result.message = 'error: missing terminal id'
    debug(res.result.message)
    next()
  } else if (req.body.enabled === undefined) {
    res.result.message = 'error: missing enabled'
    res.result.data = req.body
    next()
  } else {
    var terminalId = req.params.id

    res.result = terminalStore.updateTerminalEnabled(terminalId, req.body.enabled)

    debug(res.result)

    next()
  }
}

// Delete terminal
var deleteTerminal = function (req, res, next) {
  Logger.info({ action: 'deleteTerminal', 'user': req.user.username, device: req.params.id, message: 'user ' + req.user.username + ' deleted terminal: ' + req.params.id })

  debug(getLine(), 'deleteTerminal')

  if (!req.params.id) {
    res.result.message = 'error: missing terminal id'
    next()
  }

  var terminalId = req.params.id

  res.result = {}

  if (terminalStore.deleteTerminal(terminalId)) {
    res.result = {
      result: 'ok'
    }
  }

  next()
}

// Update terminal secret
var updateTerminalSecret = function (req, res, next) {
  Logger.info({ action: 'updateTerminalSecret', 'user': req.user.username, device: req.params.id, message: 'user ' + req.user.username + ' update terminal secret: ' + req.params.id })

  debug(getLine(), 'updateTerminalSecret')

  if (!req.params.id || req.params.id === 0) {
    res.result.message = 'error: missing terminal id'
    next('route')
  }

  var terminalId = req.params.id
  var secret = req.body.secret

  res.result = terminalStore.updateTerminalSecret(terminalId, secret)

  next()
}

// Update terminal role
var updateTerminalTarget = function (req, res, next) {
  Logger.info({ action: 'updateTerminalTarget', 'user': req.user.username, device: req.params.id, message: 'user ' + req.user.username + ' update terminal' + req.params.id + ' target: ' + req.body.target })

  debug(getLine(), 'updateTerminalTarget')

  if (!req.params.id) {
    res.result.message = 'error: missing role id'
    next()
  }

  var terminalId = req.params.id
  var target = req.body.target

  res.result = terminalStore.updateTerminalTarget(terminalId, target)

  next()
}

module.exports = { getAllTerminals, handleDefaultRequest, setDefaultResultArray, processTerminalPing, getTerminalState, getTerminalDetails, verifyTerminal, verifyTerminalEnabled, verifyHMAC, authenticateRFIDCard, updateTerminalDescription, updateTerminalEnabled, deleteTerminal, updateTerminalSecret, updateTerminalTarget }
