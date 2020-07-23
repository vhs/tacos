const _pre = require('./_pre')
const _root = require('./_root')
const _post = require('./_post')
const api = require('./api')
const auth = require('./auth')
const devices = require('./devices')
const terminals = require('./terminals')
const session = require('./session')
// const test = require('./test')

const express = require('express')
const debug = require('debug')('app:middleware')
const router = express.Router();

router.use(_pre.router)
router.use('/', _root.router)
// if (process.env.TACOS_TEST !== undefined) router.use('/', test.router)
router.use('/auth', auth.router)
router.use('/api', api.router)
router.use('/api/devices', devices.router)
router.use('/api/terminals', terminals.router)
router.use('/api/session', session.router)
router.use(_post.router)

module.exports = { router }