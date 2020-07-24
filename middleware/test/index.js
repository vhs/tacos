"use strict";

const fs = require('fs')
const path = require('path')

var express = require('express')
var debug = require('debug')('tacos:middleware:test')
var router = express.Router()
const { passport } = require('../../lib/passport')
const LocalStrategy = require('passport-local').Strategy
var { getLine } = require('../../lib/utils')

const { forceLogout, injectUsername, redirectDashboard } = require('./lib')

var users = {}
users['invalid'] = require('./data/1-invalid.json')
users['user'] = require('./data/2-user.json')
users['user-with-groups'] = require('./data/3-user-with-groups.json')
users['manager'] = require('./data/4-manager.json')
users['administrator'] = require('./data/5-administrator.json')

passport.use(new LocalStrategy(
    (username, password, done) => {
        debug(getLine(), 'LocalStrategy', 'username', username)
        if (users[username] === undefined) {
            debug(getLine(), 'LocalStrategy', 'missing user', username)
            return done(err)
        }
        if (users[username].authenticated === false) {
            debug(getLine(), 'LocalStrategy', 'unauthenticated user', username)
            return done(null, false)
        }

        debug(getLine(), 'LocalStrategy', 'good test user', username)
        debug(getLine(), 'LocalStrategy', users[username])

        return done(null, users[username]);
    }));

router.get('/test/auth/:username', forceLogout, injectUsername, passport.authenticate('local', { failureRedirect: '/login' }), redirectDashboard)

module.exports = { router }