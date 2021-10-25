const debug = require('debug')('tacos:middleware:logging')
const { convertResultToJSON, getLine } = require('../../lib/utils')
debug(getLine(), 'Loading')

const express = require('express')
const router = express.Router()

const { requireAuthenticated, requireAdmin } = require('../auth/lib')

const { setDefaultResultArray, getAllLogs, getLogDetails } = require('./lib')

// route definitions
debug(getLine(), 'Setting route definitions')

// Default result set for API requests
router.use('/', setDefaultResultArray)

// Default get request (for terminal listing in the web gui)
router.get('/', requireAuthenticated, requireAdmin, getAllLogs)

// Get terminal details (web console)
router.get('/details/:id', requireAuthenticated, requireAdmin, getLogDetails)

router.use('/', (req, res, next) => { res.set('Connection', 'close'); next() })
router.use('/', convertResultToJSON)

// Export the router
module.exports = { router }
