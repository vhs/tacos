var express = require('express')
var { config } = require('../../lib/config')
var debug = require('debug')('atoms:middleware:terminals')
var router = express.Router()

const { getSession, dumpSession } = require('./lib')
const { requireAuthenticated } = require('../auth').lib

router.get('/', getSession)
router.get('/dump', dumpSession)

module.exports = { router }