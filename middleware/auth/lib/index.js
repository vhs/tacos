const debug = require('debug')('tacos:middleware:auth:lib')
const { getLine } = require('../../../lib/utils')

const { backend } = require('../../../lib/backend')

debug(getLine(), 'Loading with', backend)

const doLogout = (req, res, next) => {
  debug('doLogout')
  req.logout()
  res.send({ result: 'OK', message: 'Logged out' })
}

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.authenticated && req.user.administrator) {
    return next()
  }
  res.status(403).send({ result: 'ERROR', code: 'NADMIN', message: 'Not authenticated' })
}

const requireAuthenticated = (req, res, next) => {
  if (req.user && req.user.authenticated) {
    return next()
  }
  res.status(403).send({ result: 'ERROR', code: 'NUSER', message: 'Not authenticated' })
}

module.exports = { doLogout, requireAdmin, requireAuthenticated }
