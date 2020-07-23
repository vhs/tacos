'use strict'

const path = require('path')

var debug = require('debug')('tacos:lib:passport:lib')
var { getLine } = require('../../utils')
var { config } = require('../../config')

const { backend } = require('../../backend')

debug(getLine(), 'Loading with', backend)

function checkBackendService(user) {
    debug(getLine(), 'checkBackendService', user)

    return backend.checkUser(user)
        .then(function (valid) {
            debug(getLine(), 'valid:', valid)
            user.authenticated = valid
            debug(getLine(), 'user:', user)
            return valid
        }).catch(function (e) {
            debug(getLine(), 'caught error:')
            debug(getLine(), e)
            return false
        })
}

async function auth(accessToken, refreshToken, profile, done) {
    debug(getLine(), 'auth', 'profile:', profile)
    var user = {
        id: profile.id,
        provider: profile.provider,
        name: profile.displayName
    }
    await checkBackendService(user)
        .finally(function (res) {
            debug(getLine(), 'auth', 'res:', res)
            debug(getLine(), 'auth', 'user:', user)
            done(null, user)
        })
}

function serializeUser(user, done) {
    // debug(getLine(), 'serializeUser:', user)
    var serialized = JSON.stringify(user)
    done(null, serialized)
}

function deserializeUser(serialized, done) {
    // debug(getLine(), 'deserializeUser:', serialized)
    done(null, JSON.parse(serialized))
}

module.exports = { checkBackendService, auth, serializeUser, deserializeUser }

