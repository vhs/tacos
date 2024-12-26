const debug = require('debug')('tacos:routes:auth')
const express = require('express')

const { defaultLimiter } = require('../../lib/middleware/rate-limit')
const { passport } = require('../../lib/passport')
const { getLine } = require('../../lib/utils')

const lib = require('./lib')

debug(getLine(), 'Loading')

const router = express.Router()

// Rate limit
router.all('/', defaultLimiter)

// Slack
router.get(
    '/slack/callback',
    passport.authenticate('Slack', {
        failureRedirect: '/login',
        successRedirect: '/dashboard'
    }),
    (_req, res) => {
        res.redirect('/dashboard')
    }
)

router.get('/slack', passport.authenticate('Slack'))

// Google
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (_req, res) => {
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
    (_req, res) => {
        res.redirect('/dashboard')
    }
)

router.get('/github', passport.authenticate('github'))

router.get('/logout', lib.doLogout)

module.exports = { router, lib }
