var debug = require('debug')('tacos:middleware:test:lib')

const forceLogout = function (req, res, next) {
    req.logout()
    next()
}

const injectUsername = function (req, res, next) {
    debug('injectUsername', 'username', req.params.username)
    req.body.username = req.params.username
    req.body.password = req.params.username
    next()
}

const redirectDashboard = function (req, res) {
    res.redirect('/dashboard')
}

module.exports = { forceLogout, injectUsername, redirectDashboard }
