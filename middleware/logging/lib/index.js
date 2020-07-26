'use strict'

var express = require('express')
var { config } = require('../../../lib/config')
var debug = require('debug')('tacos:middleware:logging:lib')
var { getLine } = require('../../../lib/utils')
var { loggingStore } = require('../../../lib/stores')
var router = express.Router()

const Logger = loggingStore.getLogger('tacos:middleware:logging:lib')

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


const getAllLogs = function (req, res, next) {
    res.result.data = loggingStore.getAllLogs()

    debug('getAllLogs', res.result)
    next()
}

const getLogDetails = function (req, res, next) {
    next()
}

// Export the router
module.exports = { setDefaultResultArray, getAllLogs, getLogDetails }
