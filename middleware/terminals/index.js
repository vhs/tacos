'use strict'

var express = require('express')
var { config } = require('../../lib/config')
var debug = require('debug')('atoms:middleware:terminals')
var router = express.Router()

var { convertResultToJSON, getLine } = require('../../lib/utils')
var { requireAuthenticated, requireAdmin } = require('../auth/lib')
var {
  getAllTerminals,
  handleDefaultRequest,
  setDefaultResultArray,
  processTerminalPing,
  getTerminalState,
  getTerminalDetails,
  verifyTerminal,
  verifyTerminalEnabled,
  verifyHMAC,
  authenticateRFIDCard,
  updateTerminalDescription,
  updateTerminalEnabled,
  deleteTerminal,
  updateTerminalSecret,
  updateTerminalTarget
} = require('./lib')

// route definitions
debug(getLine(), 'Setting route definitions')

// Default get request (for terminal listing in the web gui)
router.get('/', getAllTerminals)

// Default result set for API requests
router.use('/', setDefaultResultArray)

// Get terminal state (device query)
router.get('/state/:id', getTerminalState)

// Get terminal details (web console)
router.get('/details/:id', getTerminalDetails)

// Authenticated requests

// Terminal ping
router.post('/ping/:id', verifyTerminal, verifyHMAC, processTerminalPing)

// Authenticated terminal for an rfid
router.post('/authenticate/rfid/:id', verifyTerminal, verifyTerminalEnabled, verifyHMAC, authenticateRFIDCard)

// Web console
router.post('/delete/:id', requireAuthenticated, requireAdmin, deleteTerminal)
router.post('/update/description/:id', requireAuthenticated, requireAdmin, updateTerminalDescription)
router.post('/update/enabled/:id', requireAuthenticated, requireAdmin, updateTerminalEnabled)
router.post('/update/secret/:id', requireAuthenticated, requireAdmin, updateTerminalSecret)
router.post('/update/target/:id', requireAuthenticated, requireAdmin, updateTerminalTarget)

router.use('/', (req, res, next) => { res.set("Connection", "close"); next() })
router.use('/', (req, res, next) => { console.log('res.result:', res.result); next() })
router.use('/', convertResultToJSON)

// Export the router
module.exports = { router }