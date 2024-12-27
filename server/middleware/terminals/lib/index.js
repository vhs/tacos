'use strict'

const debug = require('debug')('tacos:middleware:terminals:lib')

const { backend } = require('../../../lib/backend')
const {
    deviceStore,
    loggingStore,
    terminalStore
} = require('../../../lib/stores/')
const { getLine, wrappedJsonStringify } = require('../../../lib/utils')

const Logger = loggingStore.getLogger('tacos:middleware:terminals:lib')

const getAllTerminals = async function (_req, res, _next) {
    debug(getLine(), 'getAllTerminals')

    res.locals.terminals = await terminalStore.getAllTerminals()
    res.send(wrappedJsonStringify(res.locals.terminals))
    // next()
}

// Default get result
const handleDefaultRequest = async function (req, res, _next) {
    debug(getLine(), 'handleDefaultRequest')

    res.locals.user = req.user
    req.session.touch()
    res.locals.terminals = await terminalStore.getAllTerminals()
    debug(getLine(), 'res.locals.terminals', res.locals.terminals)
    res.send(res.local.terminals)
}

// Set result array
const setDefaultResultArray = function (req, res, next) {
    debug(getLine(), 'setDefaultResultArray')

    res.locals.result = {
        result: 'ERROR'
    }

    if (typeof req.body !== 'object') {
        req.body = JSON.parse(req.body)
    }

    next()
}

// Query state
const processTerminalPing = function (req, res, next) {
    debug(getLine(), 'processTerminalPing')

    if (req.body.data.ping === undefined) {
        res.locals.result.message = 'error: missing ping message'
    } else {
        res.locals.result.result = 'OK'
        res.locals.result.pong = req.body.data.ping
    }

    next()
}

// Query state
const getTerminalState = async function (req, res, next) {
    debug(getLine(), 'getTerminalState')

    if (!req.params.id) {
        res.locals.result.message = 'error: missing terminal id'
        next()
    }

    if (typeof req.body !== 'object') {
        req.body = JSON.parse(req.body)
    }

    const terminalId = req.params.id

    res.locals.result = await terminalStore.getTerminalState(terminalId)
    res.locals.result.timestamp = Math.floor(Date.now() / 1000)

    next()
}

// Query state
const getTerminalDetails = async function (req, res, next) {
    debug(getLine(), 'getTerminalDetails')

    if (!req.params.id) {
        res.locals.result.message = 'error: missing terminal id'
        next()
    }

    const terminalId = req.params.id

    res.locals.result = await terminalStore.getTerminalDetails(terminalId)

    next()
}

const verifyTerminal = async function (req, res, next) {
    debug(getLine(), 'verifyTerminal')

    debug(getLine(), 'verifyTerminal: [' + req.params.id + ']')

    // Check terminalId
    if (!req.params.id) {
        res.locals.result.message = 'error: missing terminal id'
        res.status(403)
        next('route')
    } else if (!(await terminalStore.checkTerminalExists(req.params.id))) {
        res.locals.result.message = 'error: no such terminal '
        res.status(403)
        next('route')
    } else {
        next()
    }
}

const verifyTerminalEnabled = async function (req, res, next) {
    debug(getLine(), 'verifyTerminalEnabled')

    if (!(await terminalStore.checkTerminalEnabled(req.params.id))) {
        res.locals.result.message = 'error: terminal is not enabled'
        debug(getLine(), 'verifyTerminalEnabled', res.locals.result.message)
        res.status(403).send(JSON.stringify(res.locals.result))
    } else if (!(await terminalStore.checkTerminalHasTarget(req.params.id))) {
        res.locals.result.message = "error: terminal doesn't have a target"
        debug(getLine(), 'verifyTerminalEnabled', res.locals.result.message)
        res.status(403).send(JSON.stringify(res.locals.result))
    } else {
        next()
    }
}

const verifyHMAC = async function (req, res, next) {
    debug(getLine(), 'verifyHMAC')

    const terminalId = req.params.id

    if (!(await terminalStore.checkTerminalSecured(terminalId))) {
        res.locals.result.message = 'error: missing secret'
        Logger.info({
            action: 'verifyHMAC',
            user: '',
            terminal: terminalId,
            message: 'Terminal ' + terminalId + ' is missing secret'
        })
        res.status(403).send(JSON.stringify(res.locals.result))
    } else if (req.body.data === undefined || req.body.hash === undefined) {
        debug(getLine(), 'verifyHMAC', 'req.params', req.params)
        debug(getLine(), 'verifyHMAC', 'req.body', req.body)
        res.locals.result.message =
            'error: incorrect message format, missing authentication data'
        Logger.info({
            action: 'verifyHMAC',
            user: '',
            terminal: terminalId,
            message:
                'Terminal ' +
                terminalId +
                ' request had incorrect message format, missing authentication data'
        })
        res.send(JSON.stringify(res.locals.result))
    } else if (!req.body.data.nonce || !req.body.data.ts || !req.body.hash) {
        res.locals.result.message = 'error: missing auth data'
        Logger.info({
            action: 'verifyHMAC',
            user: '',
            terminal: terminalId,
            message:
                'Terminal ' +
                terminalId +
                ' request had missing auth data (nonce, ts or hash missing'
        })
        res.status(403).send(JSON.stringify(res.locals.result))
    } else {
        debug(getLine(), 'Checking HMAC')
        // Packet looks good and terminal has secret, check HMAC
        const packet = req.body

        if (!(await terminalStore.verifyHMAC(terminalId, packet))) {
            res.locals.result.message = 'error: HMAC verification failed'
            Logger.info({
                action: 'authenticateRFIDCard',
                user: '',
                terminal: terminalId,
                message: 'Terminal ' + terminalId + ' HMAC verification failed'
            })
            res.status(403).send(JSON.stringify(res.locals.result))
        } else {
            next()
        }
    }
}

const authenticateRFIDCard = async function (req, res, next) {
    debug(getLine(), 'authenticateRFIDCard')

    // Check input

    // Check message data
    if (!req.body.data && !req.body.data.cardId) {
        res.locals.result.message = 'error: missing card id'
        next('route')
    }

    const terminalId = req.params.id
    const cardId = req.body.data.card_id

    debug(getLine(), 'authenticateRFIDCard', 'terminalId', terminalId)
    debug(getLine(), 'authenticateRFIDCard', 'req.body', req.body)

    // Get target
    const terminalTarget = await terminalStore.getTerminalTarget(terminalId)
    // Get target role
    const deviceRole = await deviceStore.getDeviceRole(terminalTarget)
    debug(getLine(), 'authenticateRFIDCard', 'deviceRole', deviceRole)

    // Check user privilege for role
    const cardRequest = {}
    cardRequest.id = cardId

    debug(getLine(), 'authenticateRFIDCard', 'cardRequest', cardRequest)

    backend.checkCard(cardRequest).then(async function (_done) {
        if (!cardRequest.valid) {
            console.log(
                Date.now() + ': RFID ACCESS DENIED for ' + cardRequest.id
            )
            res.locals.result.message = 'ACCESS DENIED: invalid card id'
            Logger.info({
                action: 'authenticateRFIDCard',
                user: cardRequest.username,
                terminal: terminalId,
                target: terminalTarget,
                card_id: cardId,
                message:
                    'ACCESS DENIED for user ' +
                    cardRequest.username +
                    ' for device ' +
                    terminalTarget +
                    ' from ' +
                    terminalId
            })
            next('route')
        } else {
            // Check role against received privileges
            if (
                cardRequest.administrator ||
                cardRequest.privileges.indexOf(deviceRole) >= 0
            ) {
                console.log(
                    Date.now() +
                        ': RFID ACCESS PERMITTED for ' +
                        cardRequest.id +
                        ' - ' +
                        cardRequest.username
                )

                // Arm device
                const armResult = await deviceStore.armDevice(terminalTarget)
                if (!armResult) {
                    res.locals.result.message = 'Failed to arm device'
                    Logger.info({
                        action: 'authenticateRFIDCard',
                        user: cardRequest.username,
                        terminal: terminalId,
                        target: terminalTarget,
                        card_id: cardId,
                        message:
                            'Failed to arm device - ' +
                            cardRequest.username +
                            ' armed ' +
                            terminalTarget +
                            ' from ' +
                            terminalId
                    })
                } else {
                    Logger.info({
                        action: 'authenticateRFIDCard',
                        user: cardRequest.username,
                        terminal: terminalId,
                        target: terminalTarget,
                        card_id: cardId,
                        message:
                            'ACCESS GRANTED - user ' +
                            cardRequest.username +
                            ' armed ' +
                            terminalTarget +
                            ' from ' +
                            terminalId
                    })
                    res.locals.result.message = 'ACCESS GRANTED - Device armed'
                    res.locals.result.result = 'OK'
                }
            } else {
                console.log(
                    Date.now() +
                        ': RFID ACCESS DENIED for ' +
                        cardRequest.id +
                        ' - ' +
                        cardRequest.username
                )
                res.locals.result.message = 'ACCESS DENIED'
                Logger.info({
                    action: 'authenticateRFIDCard',
                    user: cardRequest.username,
                    terminal: terminalId,
                    target: terminalTarget,
                    card_id: cardId,
                    message:
                        'ACCESS DENIED - user ' +
                        cardRequest.id +
                        ' - ' +
                        cardRequest.username +
                        ' for device ' +
                        terminalTarget +
                        ' from ' +
                        terminalId
                })
            }

            next('route')
        }
    })
}

// Enable terminal
const updateTerminalDescription = async function (req, res, next) {
    Logger.info({
        action: 'updateTerminalDescription',
        user: req.user.username,
        device: req.params.id,
        message:
            'user ' +
            req.user.username +
            ' update terminal description device: ' +
            req.params.id
    })

    debug(getLine(), 'updateTerminalDescription')

    if (!req.params.id) {
        res.locals.result.message = 'error: missing terminal id'
        debug(res.locals.result.message)
        next()
    } else if (req.body.description === undefined) {
        res.locals.result.message = 'error: missing description'
        debug(res.locals.result.message)
        next()
    } else {
        const terminalId = req.params.id

        const description = req.body.description

        res.locals.result = await terminalStore.updateTerminalDescription(
            terminalId,
            description
        )

        next()
    }
}

// Enable terminal
const updateTerminalEnabled = async function (req, res, next) {
    Logger.info({
        action: 'updateTerminalEnabled',
        user: req.user.username,
        device: req.params.id,
        message:
            'user ' +
            req.user.username +
            ' update terminal enabled device: ' +
            req.params.id
    })

    debug(getLine(), 'updateTerminalEnabled')

    if (!req.params.id) {
        res.locals.result.message = 'error: missing terminal id'
        debug(res.locals.result.message)
        next()
    } else if (req.body.enabled === undefined) {
        res.locals.result.message = 'error: missing enabled'
        res.locals.result.data = req.body
        next()
    } else {
        const terminalId = req.params.id

        res.locals.result = await terminalStore.updateTerminalEnabled(
            terminalId,
            req.body.enabled
        )

        debug(res.locals.result)

        next()
    }
}

// Delete terminal
const deleteTerminal = async function (req, res, next) {
    Logger.info({
        action: 'deleteTerminal',
        user: req.user.username,
        device: req.params.id,
        message:
            'user ' + req.user.username + ' deleted terminal: ' + req.params.id
    })

    debug(getLine(), 'deleteTerminal')

    if (!req.params.id) {
        res.locals.result.message = 'error: missing terminal id'
        next()
    }

    const terminalId = req.params.id

    res.locals.result = {}

    if (await terminalStore.deleteTerminal(terminalId)) {
        res.locals.result = {
            result: 'ok'
        }
    }

    next()
}

// Update terminal secret
const updateTerminalSecret = async function (req, res, next) {
    Logger.info({
        action: 'updateTerminalSecret',
        user: req.user.username,
        device: req.params.id,
        message:
            'user ' +
            req.user.username +
            ' update terminal secret: ' +
            req.params.id
    })

    debug(getLine(), 'updateTerminalSecret')

    if (!req.params.id || req.params.id === 0) {
        res.locals.result.message = 'error: missing terminal id'
        next('route')
    }

    const terminalId = req.params.id
    const secret = req.body.secret

    res.locals.result = await terminalStore.updateTerminalSecret(
        terminalId,
        secret
    )

    next()
}

// Update terminal role
const updateTerminalTarget = async function (req, res, next) {
    const terminalId = req.params.id
    const target = req.body.target

    Logger.info({
        action: 'updateTerminalTarget',
        user: req.user.username,
        terminal: terminalId,
        message: `user ${req.user.username} update terminal ${terminalId} target: ${target}`
    })

    debug(getLine(), 'updateTerminalTarget', req.body)

    if (!terminalId) {
        res.locals.result.message = 'error: missing terminal id'
        next()
    }

    if (target !== null && typeof target !== 'string') {
        res.locals.result.message = 'error: invalid target id'
        next()
    }

    res.locals.result = await terminalStore.updateTerminalTarget(
        terminalId,
        target
    )

    next()
}

module.exports = {
    getAllTerminals,
    handleDefaultRequest,
    setDefaultResultArray,
    processTerminalPing,
    getTerminalState,
    getTerminalDetails,
    verifyTerminal,
    verifyTerminalEnabled,
    verifyHMAC,
    authenticateRFIDCard,
    updateTerminalDescription,
    updateTerminalEnabled,
    deleteTerminal,
    updateTerminalSecret,
    updateTerminalTarget
}
