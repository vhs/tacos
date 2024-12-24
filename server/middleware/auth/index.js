const debug = require('debug')('tacos:routes:auth')

const { getLine } = require('../../lib/utils')

debug(getLine(), 'Loading')

const express = require('express')

const router = express.Router()

const { passport } = require('../../lib/passport')

const lib = require('./lib')

// Slack
router.get(
    '/slack/callback',
    passport.authenticate('Slack', {
        failureRedirect: '/login',
        successRedirect: '/dashboard'
    }),
    (req, res) => {
        res.redirect('/dashboard')
    }
)

router.get('/slack', passport.authenticate('Slack'))

// Google
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/dashboard')
    }
)

// @ts-ignore
router.get(
    '/google',
    passport.authenticate('google', {
        scope: 'email',
        accessType: 'online',
        approvalPrompt: 'auto'
    })
)

// Github
router.get(
    '/github/callback',
    passport.authenticate('github', {
        failureRedirect: '/login',
        successRedirect: '/dashboard'
    }),
    (req, res) => {
        res.redirect('/dashboard')
    }
)

router.get('/github', passport.authenticate('github'))

router.get('/logout', lib.doLogout)

module.exports = { router, lib }
