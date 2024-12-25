'use strict'

const debug = require('debug')('tacos:lib:passport:lib')

const { backend } = require('../../backend')
const { getLine } = require('../../utils')

debug(getLine(), 'Loading with backend:', backend.name)

function checkBackendService(user) {
    debug(getLine(), 'checkBackendService', user)

    return backend
        .checkUser(user)
        .then(function (valid) {
            debug(getLine(), 'valid:', valid)
            user.authenticated = valid
            debug(getLine(), 'user:', user)
            return valid
        })
        .catch(function (e) {
            debug(getLine(), 'caught error:')
            debug(getLine(), e)
            return false
        })
}

async function auth(_accessToken, _refreshToken, profile, done) {
    debug(getLine(), 'auth', 'profile:', profile)
    const user = {
        id: profile.id,
        provider: profile.provider,
        name: profile.displayName
    }
    await checkBackendService(user).finally(function (res) {
        debug(getLine(), 'auth', 'res:', res)
        debug(getLine(), 'auth', 'user:', user)
        done(null, user)
    })
}

function serializeUser(user, done) {
    // debug(getLine(), 'serializeUser:', user)
    const serialized = JSON.stringify(user)
    done(null, serialized)
}

function deserializeUser(serialized, done) {
    // debug(getLine(), 'deserializeUser:', serialized)
    done(null, JSON.parse(serialized))
}

module.exports = { checkBackendService, auth, serializeUser, deserializeUser }
