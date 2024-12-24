const debug = require('debug')('app:middleware')

const { getLine } = require('../lib/utils')

debug(getLine(), 'Loading')

const _post = require('./_post')
const _pre = require('./_pre')
const _root = require('./_root')
const api = require('./api')
const auth = require('./auth')
const devices = require('./devices')
const logging = require('./logging')
const session = require('./session')
const terminals = require('./terminals')
const test = process.env.TACOS_TEST !== undefined ? require('./test') : null

const express = require('express')

const router = express.Router()

router.use(_pre.router)
router.use('/', _root.router)
if (test !== null) router.use('/', test.router)
router.use('/auth', auth.router)
router.use('/api', api.router)
router.use('/api/devices', devices.router)
router.use('/api/logging', logging.router)
router.use('/api/terminals', terminals.router)
router.use('/api/session', session.router)
router.use(_post.router)

module.exports = { router }
