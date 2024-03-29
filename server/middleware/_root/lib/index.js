const debug = require('debug')('app:middleware:_root:lib')
const { getLine } = require('../../../lib/utils')
debug(getLine(), 'Loading')

const { deviceStore } = require('../../../lib/stores')

function devicesStatuses (req, res, next) {
  if (req.user) {
    if (req.user.administrator) {
      res.locals.devices = deviceStore.getAllDevices()
    } else {
      res.locals.devices = deviceStore.getAvailableDevices(req.user)
    }
  }
  next()
}

module.exports = { devicesStatuses }
