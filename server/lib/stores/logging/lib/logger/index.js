const Debug = require('debug')

const { LogEntry } = require('../logentry')

const Logger = function (emitter, instance) {
    this.emitter = emitter
    this.instance = instance
    this.debug = Debug(instance)
}

Logger.prototype._log = function (level, data) {
    const instance = this.instance
    const message =
        data.length === 1 &&
        typeof data[0] === 'object' &&
        Array.isArray(data[0]) === false &&
        data[0].message !== undefined
            ? data[0].message
            : data.join(' ')
    data =
        data.length === 1 &&
        typeof data[0] === 'object' &&
        Array.isArray(data[0]) === false
            ? data[0]
            : data

    // @ts-ignore
    const logEntry = new LogEntry({ instance, level, data, message })

    this.debug(logEntry)

    this.emitter.emit(this.instance, logEntry)
}

Logger.prototype.debug = function (...data) {
    this._log('debug', data)
}

Logger.prototype.error = function (...data) {
    this._log('error', data)
}

Logger.prototype.info = function (...data) {
    this._log('info', data)
}

Logger.prototype.warn = function (...data) {
    this._log('warn', data)
}

module.exports = { Logger }
