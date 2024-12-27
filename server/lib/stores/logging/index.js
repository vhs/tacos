'use strict'

const debug = require('debug')('tacos:lib:stores:logging')
const EE2 = require('eventemitter2')

const { prisma } = require('../../db/prisma')

const { Logger } = require('./lib')

const LoggingStore = function () {
    debug('starting logging store')

    this.logging = prisma.logging

    this.loggerCache = {}

    // @ts-ignore
    this.emitter = new EE2({ wildcard: true, delimiter: ':' })

    this.emitter.on('**', (event) => {
        this.saveLog(event)
    })
}

LoggingStore.prototype.getLogger = function (instance) {
    if (this.loggerCache[instance] === undefined) {
        this.loggerCache[instance] = new Logger(this.emitter, instance)
    }

    return this.loggerCache[instance]
}

LoggingStore.prototype.saveLog = async function (event) {
    await this.logging.create({
        data: { ...event, data: JSON.stringify(event.data) }
    })
}

LoggingStore.prototype.getAllLogs = async function (_filter) {
    return await this.logging.findMany({ orderBy: { ts: 'desc' } })
}

module.exports = new LoggingStore()
