const debug = require('debug')('tacos:middleware:terminals')
const express = require('express')

const { getLine } = require('../../lib/utils')

debug(getLine(), 'Loading')

const router = express.Router()

const { getSession, dumpSession } = require('./lib')

router.get('/', getSession)
router.get('/dump', dumpSession)

module.exports = { router }
