const debug = require('debug')('app:middleware:api')
const { getLine } = require('../../lib/utils')
debug(getLine(), 'Loading')

const express = require('express')
const router = express.Router()

const { requireAuthenticated } = require('../auth/lib')

const { doPong, getRoles } = require('./lib')

router.get('/ping', doPong)

router.get('/roles', requireAuthenticated, getRoles)

module.exports = { router }
