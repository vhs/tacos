const debug = require('debug')('app:middleware:_root:lib')

const { deviceStore } = require('../../../lib/stores')
const { getLine } = require('../../../lib/utils')

debug(getLine(), 'Loading')

async function devicesStatuses(req, res, next) {
    if (req.user) {
        if (req.user.administrator) {
            res.locals.devices = await deviceStore.getAllDevices()
        } else {
            res.locals.devices = await deviceStore.getAvailableDevices(req.user)
        }
    }
    next()
}

module.exports = { devicesStatuses }
