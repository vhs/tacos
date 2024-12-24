const debug = require('debug')('app:middleware:_root')

const { getLine } = require('../../lib/utils')

debug(getLine(), 'Loading')

const express = require('express')

const router = express.Router()
const { backend } = require('../../lib/backend')

router.use('/', function (req, res, next) {
    res.locals.user = req.user
    res.locals.roles = backend.getRoles()
    req.session.touch()
    next()
})

// Only on development
const environment = process.env.NODE_ENV || 'development'

if (environment === 'development') {
    debug('Adding reload handler')
    router.all('/reload', process.exit)
}

module.exports = { router }
