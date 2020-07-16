'use strict'

var express = require('express')
var router = express.Router()
var debug = require('debug')('atoms:middleware:auth:lib')
var { getLine } = require('../../../lib/utils')

var config = require('../../../lib/config')
var backend = require('../../../lib/backend')

debug(getLine(), 'Loading with', backend)

var saveSession = (req, res, next) => {
  // req.
}

var doLogout = (req, res, next) => {
  debug('doLogout')
  req.logout()
  res.send({ result: 'OK', message: 'Logged out' })
}

var requireAdmin = (req, res, next) => {
  if (req.user && req.user.authenticated && req.user.administrator) {
    return next()
  }
  res.status(403).send({ result: 'ERROR', code: 'NADMIN', message: 'Not authenticated' })
}

var requireAuthenticated = (req, res, next) => {
  if (req.user && req.user.authenticated) {
    return next()
  }
  res.status(403).send({ result: 'ERROR', code: 'NUSER', message: 'Not authenticated' })
}

module.exports = { doLogout, requireAdmin, requireAuthenticated }
module.exports.test = { doLogout, requireAdmin, requireAuthenticated }
