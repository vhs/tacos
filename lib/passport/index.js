'use strict'

const path = require('path')

var debug = require('debug')('atoms:lib:passport')
var { getLine } = require('../utils')
var passport = require('passport')
var SlackStrategy = require('passport-slack').Strategy
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
var GitHubStrategy = require('passport-github').Strategy

const { auth, serializeUser, deserializeUser } = require('./lib')

var config = require(path.join(__dirname, '../config'))

var backend = require('../backend')

debug(getLine(), 'Loading with', backend)

// Slack
passport.use(
    new SlackStrategy(
        {
            clientID: config.authentication.slack.clientID,
            clientSecret: config.authentication.slack.clientSecret,
            callbackURL: config.callbackHost + '/auth/slack/callback'
        },
        auth
    )
)

// Google
passport.use(
    new GoogleStrategy(
        {
            clientID: config.authentication.google.clientID,
            clientSecret: config.authentication.google.clientSecret,
            callbackURL: config.callbackHost + '/auth/google/callback'
        },
        auth
    )
)

// GitHub
passport.use(
    new GitHubStrategy(
        {
            clientID: config.authentication.github.clientID,
            clientSecret: config.authentication.github.clientSecret,
            callbackURL: config.callbackHost + '/auth/github/callback'
        },
        auth
    )
)

function init(app) {
    app.use(passport.initialize())
    app.use(passport.session())
    passport.serializeUser(serializeUser)
    passport.deserializeUser(deserializeUser)
}

module.exports = { init, passport }