'use strict'

const path = require('path')

const debug = require('debug')('tacos:lib:stores:logging')

const { getLine } = require('../../utils')
const Loki = require('lokijs')
const EE2 = require('eventemitter2')

const { Logger } = require('./lib')

const LoggingStore = function (dataDir, options) {
  options = options || { persistence: true, save_interval: 15 }

  this.loggingDB = new Loki(path.resolve(dataDir, 'loggingStore.json'))
  this.loggingDB.loadDatabase({}, () => {
    debug(getLine(), 'Loading database...')
    debug(getLine(), 'Loading logs collection...')
    this.logs = this.loggingDB.getCollection('logs')
    if (this.logs === null) {
      debug(getLine(), 'Collection not found!')
      debug(getLine(), 'Adding collection!')
      this.logs = this.loggingDB.addCollection('logs', { indices: ['ts', 'level', 'component'], autoupdate: true })
    }
  })

  this.loggerCache = {}

  // @ts-ignore
  this.emitter = new EE2({ wildcard: true, delimiter: ':' })

  this.emitter.on('**', (event) => {
    this.saveLog(event)
  })

  if (options.persistence === true) {
    setInterval(() => {
      debug(getLine(), 'Autosaving')
      this.loggingDB.saveDatabase()
    }, options.save_interval * 1000)
  }
}

LoggingStore.prototype.getLogger = function (instance) {
  if (this.loggerCache[instance] === undefined) {
    this.loggerCache[instance] = new Logger(this.emitter, instance)
  }

  return this.loggerCache[instance]
}

LoggingStore.prototype.saveLog = function (event) {
  this.logs.insert(event)
}

LoggingStore.prototype.getAllLogs = function (filter) {
  const criteria = { ts: { $gt: 0 } }
  return this.logs.find(criteria)
}

let loggingStore = null

const getInstance = function (dataDir) {
  if (loggingStore === null) { loggingStore = new LoggingStore(dataDir) }

  return loggingStore
}

module.exports = getInstance
