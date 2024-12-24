const debug = require('debug')('tacos:middleware:devices:lib')

const { getLine } = require('../../../lib/utils')

debug(getLine(), 'Loading')

const { deviceStore, loggingStore } = require('../../../lib/stores')

const Logger = loggingStore.getLogger('tacos:middleware:devices:lib')

const setResultArray = function (req, res, next) {
    res.locals.result = {}

    next()
}

const requireValidDevice = function (req, res, next) {
    const deviceId = req.params.id

    if (deviceId === undefined || !deviceStore.checkDeviceExists(deviceId)) {
        res.locals.result = {
            message: 'Missing device'
        }
        next('route')
    }
}

const requireToolAccess = function (req, res, next) {
    const deviceId = req.params.id

    if (deviceId === undefined) {
        res.locals.result = {
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
        res.locals.result.result = 'ERROR'
        res.locals.result.message = 'error: missing user information'
        next()
    }

    if (
        req.user.administrator !== undefined &&
        req.user.administrator === true
    ) {
        res.locals.result = deviceStore.getAllDevices()
    } else {
        res.locals.result = deviceStore.getAvailableDevices(req.user)
    }

    next('route')
}

const getDeviceState = function (req, res, next) {
    if (!req.params.id) {
        res.locals.result.message = 'error: missing device id'
        next()
    }

    const deviceId = req.params.id

    res.locals.result = deviceStore.getDeviceState(deviceId)

    next()
}

const getDeviceDetails = function (req, res, next) {
    if (!req.params.id) {
        res.locals.result.message = 'error: missing device id'
        next()
    }

    const deviceId = req.params.id

    res.locals.result = deviceStore.getDeviceDetails(deviceId)

    next()
}

const deleteDevice = function (req, res, next) {
    Logger.info({
        action: 'deleteDevice',
        user: req.user.username,
        device: req.params.id,
        message:
            'user ' + req.user.username + ' deleted device: ' + req.params.id
    })

    if (!req.params.id) {
        res.locals.result.message = 'error: missing device id'
        next()
    }

    const deviceId = req.params.id

    res.locals.result = {}

    if (deviceStore.deleteDevice(deviceId)) {
        res.locals.result = {
            result: 'ok'
        }
    }

    next()
}

const updateDeviceRole = function (req, res, next) {
    Logger.info({
        action: 'updateDeviceRole',
        user: req.user.username,
        device: req.params.id,
        message:
            'user ' +
            req.user.username +
            ' updated device role: ' +
            req.params.id
    })

    if (!req.params.id) {
        res.locals.result.message = 'error: missing role id'
        next()
    }

    const deviceId = req.params.id
    const role = req.body.role

    res.locals.result = deviceStore.updateDeviceRole(deviceId, role)

    next()
}

const updateDeviceDescription = function (req, res, next) {
    Logger.info({
        action: 'updateDeviceDescription',
        user: req.user.username,
        device: req.params.id,
        message:
            'user ' +
            req.user.username +
            ' updated description device: ' +
            req.params.id
    })

    debug('updateDeviceDescription', 'req.params:', req.params)
    debug('updateDeviceDescription', 'req.body:', req.body)

    if (!req.params.id || req.params.id === 0) {
        res.locals.result.message = 'error: missing device id'
        next('route')
    }

    const deviceId = req.params.id
    const description = req.body.description

    debug('updateDeviceDescription', 'description:', description)

    res.locals.result = deviceStore.updateDeviceDescription(
        deviceId,
        description
    )

    next()
}

const updateDeviceHasSecret = function (req, res, next) {
    Logger.info({
        action: 'updateDeviceHasSecret',
        user: req.user.username,
        device: req.params.id,
        message:
            'user ' +
            req.user.username +
            ' update device has secret: ' +
            req.params.id
    })

    if (!req.params.id || req.params.id === 0) {
        res.locals.result.message = 'error: missing device id'
        next('route')
    }

    const deviceId = req.params.id
    const hasSecret = req.body.hasSecret

    res.locals.result = deviceStore.updateDeviceHasSecret(deviceId, hasSecret)

    next()
}

const updateDeviceSecret = function (req, res, next) {
    Logger.info({
        action: 'updateDeviceHasSecret',
        user: req.user.username,
        device: req.params.id,
        message:
            'user ' +
            req.user.username +
            ' update device secret: ' +
            req.params.id
    })

    if (!req.params.id || req.params.id === 0) {
        res.locals.result.message = 'error: missing device id'
        next('route')
    }

    const deviceId = req.params.id
    const secret = req.body.secret

    res.locals.result = deviceStore.updateDeviceSecret(deviceId, secret)

    next()
}

const armDevice = function (req, res, next) {
    Logger.info({
        action: 'armDevice',
        user: req.user.username,
        device: req.params.id,
        message: 'user ' + req.user.username + ' armed device: ' + req.params.id
    })

    if (!req.params.id) {
        res.locals.result.message = 'error: missing device id'
        next()
    }

    const deviceId = req.params.id

    res.locals.result = deviceStore.armDevice(deviceId)

    next()
}

const unarmDevice = function (req, res, next) {
    Logger.info({
        action: 'unarmDevice',
        user: req.user.username,
        device: req.params.id,
        message:
            'user ' + req.user.username + ' unarmed device: ' + req.params.id
    })

    if (!req.params.id) {
        res.locals.result.message = 'error: missing device id'
        next()
    }

    const deviceId = req.params.id

    res.locals.result = deviceStore.unarmDevice(deviceId)

    next()
}

// Export the router
module.exports = {
    setResultArray,
    requireValidDevice,
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
}
