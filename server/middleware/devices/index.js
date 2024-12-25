const debug = require('debug')('tacos:routes:devices')
const express = require('express')

const { convertResultToJSON, getLine } = require('../../lib/utils')
const { requireAuthenticated, requireAdmin } = require('../auth/lib')

debug(getLine(), 'Loading')

const router = express.Router()

const {
    setResultArray,
    requireToolAccess,
    getDevices,
    getDeviceState,
    getDeviceDetails,
    deleteDevice,
    updateDeviceRole,
    updateDeviceDescription,
    updateDeviceHasSecret,
    updateDeviceSecret,
    armDevice,
    unarmDevice
} = require('./lib')

// Set result array
router.use('/', setResultArray)

// Query state
router.get('/', getDevices)

// Query state
router.get('/state/:id', getDeviceState, (_req, res, next) => {
    res.set('Connection', 'close')
    next()
})

// Query state
router.get('/details/:id', getDeviceDetails)

// Delete device
router.post('/delete/:id', requireAuthenticated, requireAdmin, deleteDevice)

// Update device role
router.post(
    '/update/role/:id',
    requireAuthenticated,
    requireAdmin,
    updateDeviceRole
)

// Update device description
router.post(
    '/update/description/:id',
    requireAuthenticated,
    requireAdmin,
    updateDeviceDescription
)

// Update device hassecret
router.post(
    '/update/hassecret/:id',
    requireAuthenticated,
    requireAdmin,
    updateDeviceHasSecret
)

// Update device secret
router.post(
    '/update/secret/:id',
    requireAuthenticated,
    requireAdmin,
    updateDeviceSecret
)

// Activate device
router.post('/arm/:id', requireAuthenticated, requireToolAccess, armDevice)

// Deactivate device
router.post('/unarm/:id', requireAuthenticated, requireToolAccess, unarmDevice)

// Convert to JSON
router.use('/', convertResultToJSON)

// Export the router
module.exports = { router }
