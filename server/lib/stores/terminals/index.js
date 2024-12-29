'use strict'

const CryptoJS = require('crypto-js')
const debug = require('debug')('tacos:lib:stores:terminals')

const { prisma } = require('../../db/prisma')
const { getLine } = require('../../utils')

const TerminalStore = function () {
    debug(getLine(), 'Loading database...')

    this.terminals = prisma.terminals
}

TerminalStore.prototype.getAllTerminals = async function () {
    const allTerminals = await this.terminals.findMany({
        where: { id: { not: '' } }
    })

    debug.extend('getAllTerminals')(getLine(), { allTerminals })

    return allTerminals
}

TerminalStore.prototype.getAvailableTerminals = async function (user) {
    const terminalsList = {}

    const allTerminals = await this.getAllTerminals()

    for (const terminal of allTerminals) {
        if (await this.checkTerminalAccess(terminal.id, user))
            terminalsList[terminal.id] = terminal
    }

    return terminalsList
}

TerminalStore.prototype.registerTerminal = async function (terminalId) {
    debug(getLine(), 'registerTerminal', 'Trying...', terminalId)

    const terminalResult = await this.terminals.upsert({
        where: { id: terminalId },
        create: {
            id: terminalId,
            description: terminalId,
            target: '',
            enabled: 0,
            secure: 0,
            secret: ''
        },
        update: {
            last_seen: Date.now()
        }
    })

    return terminalResult
}

TerminalStore.prototype.enableTerminal = async function (terminalId) {
    let terminalResult = await this.terminals.findUnique({
        where: { id: terminalId }
    })

    if (terminalResult === null) {
        return { error: 'No such terminal' }
    }

    terminalResult = await this.terminals.update({
        where: { id: terminalId },
        data: { enabled: 1 }
    })

    const result = {}
    result.id = terminalResult.id
    result.enabled = terminalResult.enabled

    return await this.getTerminalDetails(terminalId)
}

TerminalStore.prototype.disableTerminal = async function (terminalId) {
    await this.terminals.update({
        where: { id: terminalId },
        data: { enabled: 0 }
    })

    return await this.getTerminalDetails(terminalId)
}

TerminalStore.prototype.updateTerminalDescription = async function (
    terminalId,
    description
) {
    await this.terminals.update({
        where: { id: terminalId },
        data: { description }
    })

    return await this.getTerminalDetails(terminalId)
}

TerminalStore.prototype.updateTerminalEnabled = async function (
    terminalId,
    toggle
) {
    debug(
        getLine(),
        'TerminalStore.prototype.updateTerminalEnabled',
        typeof toggle
    )

    await this.terminals.update({
        where: { id: terminalId },
        data: { enabled: toggle === 1 || toggle === 'on' ? 1 : 0 }
    })

    return await this.getTerminalDetails(terminalId)
}

TerminalStore.prototype.updateTerminalSecret = async function (
    terminalId,
    secret
) {
    await this.terminals.update({
        where: { id: terminalId },
        data: { secret }
    })

    return await this.getTerminalDetails(terminalId)
}

TerminalStore.prototype.updateTerminalTarget = async function (
    terminalId,
    target
) {
    debug(getLine(), `updateTerminalTarget[${terminalId}]`, `target: ${target}`)
    await this.terminals.update({
        where: { id: terminalId },
        data: { target }
    })

    return await this.getTerminalDetails(terminalId)
}

TerminalStore.prototype.updateTerminalHasSecret = async function (
    terminalId,
    hasSecret
) {
    await this.terminals.findUnique({
        where: { id: terminalId },
        data: { hasSecret }
    })

    return await this.getTerminalDetails(terminalId)
}

TerminalStore.prototype.getTerminalList = async function () {
    return await this.getAllTerminals()
}

TerminalStore.prototype.checkTerminalEnabled = async function (terminalId) {
    const terminalResult = await this.terminals.findUnique({
        where: { id: terminalId }
    })

    debug(getLine(), 'checkTerminalEnabled', 'terminalResult', terminalResult)

    return terminalResult && Boolean(terminalResult.enabled) === true
}

TerminalStore.prototype.checkTerminalHasTarget = async function (terminalId) {
    const terminalResult = await this.terminals.findUnique({
        where: { id: terminalId }
    })

    return terminalResult && terminalResult.target !== ''
}

TerminalStore.prototype.getTerminalTarget = async function (terminalId) {
    const terminalResult = await this.terminals.findUnique({
        where: { id: terminalId }
    })

    return terminalResult.target
}

TerminalStore.prototype.getTerminalState = async function (terminalId) {
    const terminalResult = await this.registerTerminal(terminalId)

    const result = {}
    result.result = 'OK'
    result.hasTarget = !!terminalResult.target.length
    result.secure = terminalResult.secure

    return result
}

TerminalStore.prototype.getTerminalDetails = async function (terminalId) {
    const terminalResult = await this.terminals.findUnique({
        where: { id: terminalId }
    })

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

TerminalStore.prototype.deleteTerminal = async function (terminalId) {
    try {
        await this.terminals.delete({ where: { id: terminalId } })
        return true
    } catch (err) {
        console.error(err)

        return false
    }
}

TerminalStore.prototype.checkTerminalExists = async function (terminalId) {
    const terminalResult = await this.terminals.findUnique({
        where: { id: terminalId }
    })

    return terminalResult !== null
}

TerminalStore.prototype.checkTerminalSecured = async function (terminalId) {
    debug(getLine(), 'checkTerminalSecured')
    const terminalResult = await this.terminals.findUnique({
        where: { id: terminalId }
    })

    return Boolean(terminalResult?.secure) === true
}

TerminalStore.prototype.setTerminalSecure = async function (terminalId) {
    await this.terminals.update({
        where: { id: terminalId },
        data: { secure: 1 }
    })
}

TerminalStore.prototype.checkTerminalAccess = async function (
    terminalId,
    user
) {
    if (user.administrator) {
        return true
    }

    const terminalResult = await this.terminals.findUnique({
        where: { id: terminalId }
    })

    return user.privileges.includes(terminalResult.role)
}

TerminalStore.prototype.verifyHMAC = async function (terminalId, packet) {
    const terminalResult = await this.terminals.findUnique({
        where: { id: terminalId }
    })

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

        await this.terminals.update({
            where: { id: terminalId },
            data: { secure: 0 }
        })

        return false
    } else if (
        packet.data.ts < Math.round(Date.now() / 1000) - 30 ||
        packet.data.ts > Math.round(Date.now() / 1000) + 30
    ) {
        // We calculate to epoch from node native millisecond time
        debug(getLine(), 'verifyHMAC: time out of scope - replay attack?')
        return false
    }

    await this.terminals.update({
        where: { id: terminalId },
        data: { secure: 1 }
    })

    return true
}

module.exports = new TerminalStore()
