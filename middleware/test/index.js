const express = require('express')
const router = express.Router()

const { passport } = require('../../lib/passport')
const LocalStrategy = require('passport-local').Strategy

const { forceLogout, injectUsername, redirectDashboard } = require('./lib')

const users = {}
users.invalid = require('./data/1-invalid.json')
users.user = require('./data/2-user.json')
users['user-with-groups'] = require('./data/3-user-with-groups.json')
users.manager = require('./data/4-manager.json')
users.administrator = require('./data/5-administrator.json')

passport.use(new LocalStrategy(
  function (username, password, done) {
    if (users[username] === undefined || username !== password) {
      return done(null, false)
    }
    return done(null, users[username])
  }
))

router.get('/test/auth/:username', forceLogout, injectUsername, passport.authenticate('local', { failureRedirect: '/login' }), redirectDashboard)

module.exports = { router }
