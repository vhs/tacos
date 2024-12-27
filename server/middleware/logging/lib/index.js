const debug = require('debug')('tacos:middleware:logging:lib')

const { loggingStore } = require('../../../lib/stores')
const { getLine } = require('../../../lib/utils')

debug(getLine(), 'Loading')

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

const getAllLogs = async function (_req, res, next) {
    res.locals.result.data = await loggingStore.getAllLogs()

    res.locals.result.result = 'OK'

    next()
}

const getLogDetails = function (_req, _res, next) {
    next()
}

// Export the router
module.exports = { setDefaultResultArray, getAllLogs, getLogDetails }
