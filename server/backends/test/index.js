'use strict'

const debug = require('debug')('tacos:backend:test')

const { config } = require('../../lib/config')
const getLine = require('../../lib/utils').getLine

debug(getLine(), 'Loading test backend')

const testRoles = require('./data/roles.json')

const testUsers = []
testUsers[1] = require('./data/user1-invalid.json')
testUsers[2] = require('./data/user2-valid.json')
testUsers[3] = require('./data/user3-valid-groups.json')
testUsers[4] = require('./data/user4-manager.json')
testUsers[5] = require('./data/user5-administrator.json')

const testCards = {}
testCards['04:F3:63:EA:50:49:81'] = require('./data/card1-invalid.json')
testCards['04:F3:63:EA:50:49:82'] = require('./data/card2-valid.json')
testCards['04:F3:63:EA:50:49:83'] = require('./data/card3-valid-groups.json')
testCards['04:F3:63:EA:50:49:84'] = require('./data/card4-manager.json')
testCards['04:F3:63:EA:50:49:85'] = require('./data/card5-administrator.json')

const getRoles = function () {
    debug(getLine(), 'getRoles')

    return testRoles
}

function checkUser(user) {
    const userPromise = new Promise(function (resolve, reject) {
        debug(getLine(), 'checkUser')
        const service = user.provider
        const id = user.id

        if (service === undefined || id === undefined) {
            debug(getLine(), 'Invalid or missing service or id')
            reject(new Error('Invalid or missing service or id'))
            return false
        }

        debug(getLine(), 'Service Name: ' + service)
        debug(getLine(), 'Service ID: ' + id)

        const userResult = testUsers[id]

        debug(getLine(), userResult)

        let authenticated = false
        if (userResult?.valid && userResult?.privileges) {
            // Save username
            user.username = userResult.username

            // Set defaults
            user.administrator = false
            user.privileges = userResult.privileges

            // If the user has the administrator_role, set administrator
            if (user.privileges.indexOf(config.administrator_role) >= 0) {
                user.administrator = true
            }

            // Else if user is Nomos administrator override administrator
            if (user.privileges.indexOf('administrator') >= 0) {
                user.administrator = true
            }

            // Set as authenticated
            authenticated = true

            resolve(authenticated)
        } else {
            debug(getLine(), 'Invalid user')
            reject(new Error('Invalid user'))
        }
    })
    return userPromise
}

const checkCard = function (cardRequest) {
    debug(getLine(), 'checkRFIDCard')
    debug(getLine(), cardRequest)

    const params = {}
    params.rfid = cardRequest.id

    const cardResult = testCards[cardRequest.id]

    debug(getLine(), 'got CheckRFID result:', cardResult.valid)

    let valid = false
    if (cardResult?.valid) {
        // Save valid
        valid = cardRequest.valid = cardResult.valid

        // Set defaults
        cardRequest.privileges = []
        cardRequest.administrator = false

        if (valid) {
            // Save username
            cardRequest.username = cardResult.username

            // Get default privileges
            for (const privIdx in cardResult.privileges) {
                cardRequest.privileges.push(cardResult.privileges[privIdx].code)
            }

            // If the user has the administrator_role, set administrator
            if (
                cardRequest.privileges.indexOf(config.administrator_role) >= 0
            ) {
                debug(
                    getLine(),
                    'User',
                    cardRequest.username,
                    'has administrator_role'
                )
                cardRequest.administrator = true
            }

            // Else if user is Nomos administrator override administrator
            if (cardRequest.privileges.indexOf('administrator') >= 0) {
                debug(
                    getLine(),
                    'User',
                    cardRequest.username,
                    'is administrator'
                )
                cardRequest.administrator = true
            }
        }
    }

    return valid
}

module.exports = { getRoles, checkUser, checkCard }
