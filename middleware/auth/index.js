'use strict'

var express = require('express')
var router = express.Router()
var debug = require('debug')('tacos:routes:auth')
var { getLine } = require('../../lib/utils')

var { passport } = require('../../lib/passport')

var lib = require('./lib')

var { config } = require('../../lib/config')

// Slack
router.get('/slack/callback', passport.authenticate('Slack', { failureRedirect: '/login', successRedirect: '/dashboard' }), (req, res) => { res.redirect('/dashboard') })

router.get('/slack', passport.authenticate('Slack'))

// Google
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => { res.redirect('/dashboard') })

router.get('/google', passport.authenticate('google', { scope: 'email', accessType: 'online', approvalPrompt: 'auto' }))

// Github
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login', successRedirect: '/dashboard' }), (req, res) => { res.redirect('/dashboard') })

router.get('/github', passport.authenticate('github'))

router.get('/logout', lib.doLogout)

module.exports = { router, lib }
