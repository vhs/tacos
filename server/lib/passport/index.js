'use strict'

const debug = require('debug')('tacos:lib:passport')
const passport = require('passport')
const GitHubStrategy = require('passport-github').Strategy
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const SlackStrategy = require('passport-slack-oauth2').Strategy

const { backend } = require('../backend')
const { config } = require('../config')
const { getLine } = require('../utils')

const { auth, serializeUser, deserializeUser } = require('./lib')

debug(getLine(), 'Loading with', backend)

// Slack
passport.use(
    // @ts-ignore
    new SlackStrategy(
        {
            clientID: config.authentication.slack.clientID,
            clientSecret: config.authentication.slack.clientSecret,
            callbackURL: config.callbackHost + '/auth/slack/callback',
            scope: ['identity.basic'],
            team: config.authentication.slack.team
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
