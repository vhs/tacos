const debug = require('debug')('app:middleware:api')
const express = require('express')

const { getLine } = require('../../lib/utils')
const { requireAuthenticated } = require('../auth/lib')

const { doPong, getRoles } = require('./lib')

debug(getLine(), 'Loading')

const router = express.Router()

router.get('/ping', doPong)

router.get('/roles', requireAuthenticated, getRoles)

module.exports = { router }
