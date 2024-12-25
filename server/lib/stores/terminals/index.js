'use strict'

const path = require('path')

const CryptoJS = require('crypto-js')
const debug = require('debug')('tacos:lib:stores:terminals')
const Loki = require('lokijs')

const { getLine } = require('../../utils')

const TerminalStore = function (dataDir) {
    this.terminalDB = new Loki(path.resolve(dataDir, 'terminalStore.json'))
    this.terminalDB.loadDatabase({}, () => {
        debug(getLine(), 'Loading database...')
        debug(getLine(), 'Loading terminals collection...')
        this.terminals = this.terminalDB.getCollection('terminals')
        if (this.terminals === null) {
            debug(getLine(), 'Collection not found!')
            debug(getLine(), 'Adding collection!')
            this.terminals = this.terminalDB.addCollection('terminals', {
                indices: ['id'],
                autoupdate: true
            })
        }
    })

    setInterval(() => {
        debug(getLine(), 'Autosaving')
        this.terminalDB.saveDatabase()
    }, 10000)
}

TerminalStore.prototype.getAllTerminals = function () {
    return this.terminals.find({ id: { $ne: '' } })
}

TerminalStore.prototype.getAvailableTerminals = function (user) {
    const terminalsList = {}

    this.getAllTerminals().forEach(function (terminal) {
        if (this.checkTerminalAccess(terminal.id, user)) {
            terminalsList[terminal.id] = terminal
        }
    })

    return terminalsList
}

TerminalStore.prototype.registerTerminal = function (terminalId) {
    debug(getLine(), 'registerTerminal', 'Trying...', terminalId)

    let terminalResult = this.terminals.findOne({ id: terminalId })

    if (terminalResult === null) {
        terminalResult = {
            id: terminalId,
            description: terminalId,
            target: '',
            enabled: 0,
            secure: 0,
            secret: ''
        }

        terminalResult = this.terminals.insert(terminalResult)
    }

    terminalResult.last_seen = Date.now()

    this.terminals.update(terminalResult)

    return terminalResult
}

TerminalStore.prototype.enableTerminal = function (terminalId) {
    const terminalResult = this.terminals.findOne({ id: terminalId })

    if (terminalResult === null) {
        return { error: 'No such terminal' }
    }

    terminalResult.enabled = 1

    const result = {}
    result.id = terminalResult.id
    result.enabled = terminalResult.enabled

    return this.getTerminalDetails(terminalId)
}

TerminalStore.prototype.disableTerminal = function (terminalId) {
    const terminalResult = this.terminals.findOne({ id: terminalId })

    if (terminalResult === null) {
        return { error: 'No such terminal' }
    }

    terminalResult.enabled = 0

    return this.getTerminalDetails(terminalId)
}

TerminalStore.prototype.updateTerminalDescription = function (
    terminalId,
    description
) {
    const terminalResult = this.terminals.findOne({ id: terminalId })

    terminalResult.description = description

    return this.getTerminalDetails(terminalId)
}

TerminalStore.prototype.updateTerminalEnabled = function (terminalId, toggle) {
    const terminalResult = this.terminals.findOne({ id: terminalId })

    debug(
        getLine(),
        'TerminalStore.prototype.updateTerminalEnabled',
        typeof toggle
    )

    if (toggle === 1 || toggle === 'on') {
        terminalResult.enabled = 1
    } else {
        terminalResult.enabled = 0
    }

    return this.getTerminalDetails(terminalId)
}

TerminalStore.prototype.updateTerminalSecret = function (terminalId, secret) {
    const terminalResult = this.terminals.findOne({ id: terminalId })

    terminalResult.secret = secret

    return this.getTerminalDetails(terminalId)
}

TerminalStore.prototype.updateTerminalTarget = function (terminalId, target) {
    const terminalResult = this.terminals.findOne({ id: terminalId })

    terminalResult.target = target

    return this.getTerminalDetails(terminalId)
}

TerminalStore.prototype.updateTerminalHasSecret = function (
    terminalId,
    hasSecret
) {
    const terminalResult = this.terminals.findOne({ id: terminalId })

    terminalResult.hasSecret = hasSecret

    return this.getTerminalDetails(terminalId)
}

TerminalStore.prototype.getTerminalList = function () {
    return this.getAllTerminals()
}

TerminalStore.prototype.checkTerminalEnabled = function (terminalId) {
    const terminalResult = this.terminals.findOne({ id: terminalId })

    debug(getLine(), 'checkTerminalEnabled', 'terminalResult', terminalResult)

    return (
        terminalResult &&
        (terminalResult.enabled === true || terminalResult.enabled === 1)
    )
}

TerminalStore.prototype.checkTerminalHasTarget = function (terminalId) {
    const terminalResult = this.terminals.findOne({ id: terminalId })

    return terminalResult && terminalResult.target !== ''
}

TerminalStore.prototype.getTerminalTarget = function (terminalId) {
    const terminalResult = this.terminals.findOne({ id: terminalId })

    return terminalResult.target
}

TerminalStore.prototype.getTerminalState = function (terminalId) {
    const terminalResult = this.registerTerminal(terminalId)

    const result = {}
    result.result = 'OK'
    result.hasTarget = !!terminalResult.target.length
    result.secure = terminalResult.secure

    return result
}

TerminalStore.prototype.getTerminalDetails = function (terminalId) {
    const terminalResult = this.terminals.findOne({ id: terminalId })

    if (terminalResult === null) {
        return { error: 'No such terminal' }
    }

    const result = {}
    result.success = true
    result.id = terminalResult.id
    result.last_seen = terminalResult.last_seen
    result.description = terminalResult.description
    result.enabled = terminalResult.enabled
    result.secure = terminalResult.secure
    result.target = terminalResult.target
    result.secret = terminalResult.secret

    return result
}

TerminalStore.prototype.deleteTerminal = function (terminalId) {
    const terminalResult = this.terminals
        .chain()
        .find({ id: { $eq: terminalId } })
        .remove()
        .data()

    return terminalResult.length === 0
}

TerminalStore.prototype.checkTerminalExists = function (terminalId) {
    const terminalResult = this.terminals.findOne({ id: terminalId })

    return terminalResult !== null
}

TerminalStore.prototype.checkTerminalSecured = function (terminalId) {
    debug(getLine(), 'checkTerminalSecured')
    const terminalResult = this.terminals.findOne({ id: terminalId })

    return (
        terminalResult !== null &&
        (terminalResult.secure === 1 || terminalResult.secret !== '')
    )
}

TerminalStore.prototype.setTerminalSecure = function (terminalId) {
    const terminalResult = this.terminals.findOne({ id: terminalId })

    terminalResult.secure = 1
}

TerminalStore.prototype.checkTerminalAccess = function (terminalId, user) {
    if (user.administrator) {
        return true
    }

    const terminalResult = this.terminals.findOne({ id: terminalId })

    return user.privileges.indexOf(terminalResult.role) >= 0
}

TerminalStore.prototype.verifyHMAC = function (terminalId, packet) {
    const terminalResult = this.terminals.findOne({ id: terminalId })

    if (!terminalResult) {
        return false
    }

    const data = packet.data
    const hash = packet.hash

    const key = data.nonce + data.ts + terminalResult.secret

    debug(getLine(), 'verifyHMAC', packet)
    debug(getLine(), 'verifyHMAC', JSON.stringify(packet))
    debug(getLine(), 'verifyHMAC', JSON.stringify(packet.data))

    const checkedHash = CryptoJS.HmacSHA256(
        JSON.stringify(data),
        key
    ).toString()

    debug(
        getLine(),
        'verifyHMAC',
        'ts',
        packet.data.ts,
        'vs',
        Math.round(Date.now() / 1000),
        '=',
        Math.round(Date.now() / 1000) - parseInt(packet.data.ts)
    )

    if (checkedHash !== hash) {
        debug(getLine(), 'verifyHMAC: incorrect hash')
        debug(getLine(), 'verifyHMAC', 'Got:', hash)
        debug(getLine(), 'verifyHMAC', 'Expected:', checkedHash)
        terminalResult.secure = 0
        return false
    } else if (
        packet.data.ts < Math.round(Date.now() / 1000) - 30 ||
        packet.data.ts > Math.round(Date.now() / 1000) + 30
    ) {
        // We calculate to epoch from node native millisecond time
        debug(getLine(), 'verifyHMAC: time out of scope - replay attack?')
        return false
    }

    terminalResult.secure = 1

    return true
}

let terminalStore = null

const getInstance = function (dataDir) {
    if (terminalStore === null) {
        terminalStore = new TerminalStore(dataDir)
    }

    return terminalStore
}

module.exports = getInstance
