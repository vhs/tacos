const debug = require('debug')('tacos:middleware:logging:lib')
const { getLine } = require('../../../lib/utils')
debug(getLine(), 'Loading')

const { loggingStore } = require('../../../lib/stores')

// const Logger = loggingStore.getLogger('tacos:middleware:logging:lib')

const setDefaultResultArray = function (req, res, next) {
  debug(getLine(), 'setDefaultResultArray')

  res.locals.result = {
    result: 'ERROR'
  }

  if (typeof req.body !== 'object') {
    req.body = JSON.parse(req.body)
  }

  next()
}

const getAllLogs = function (req, res, next) {
  res.locals.result.data = loggingStore.getAllLogs()

  debug('getAllLogs', res.locals.result)
  next()
}

const getLogDetails = function (req, res, next) {
  next()
}

// Export the router
module.exports = { setDefaultResultArray, getAllLogs, getLogDetails }
