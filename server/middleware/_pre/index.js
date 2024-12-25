const path = require('path')

const debug = require('debug')('app:middleware:_pre')
const express = require('express')

const { getLine } = require('../../lib/utils')

debug(getLine(), 'Loading')

const router = express.Router()

router.use(
    '/',
    express.static(path.resolve(path.join(__dirname, '../../public')))
)

router.use('/', function (_req, res, next) {
    res.locals.result = {}
    next()
})

module.exports = { router }
