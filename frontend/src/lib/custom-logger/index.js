const logColours = {
    info: '',
    debug: 'color: dodgerblue;font-weight:bold',
    error: 'color: orange;font-weight:bold',
    warn: 'color: indianred;font-weight:bold',
}
class CustomLogger {
    loggerName
    logColours
    regex

    constructor(loggerName) {
        this.loggerName = loggerName
        this.logColours = logColours

        this.regex = new RegExp(((process.env.REACT_APP_DEBUG !== undefined ? process.env.REACT_APP_DEBUG : '^$').replace(/\*/, '.*')))
    }

    extend(newLoggerName) {
        return new this(this.loggerName + ':' + newLoggerName)
    }

    output(level, ...msg) {
        if (this.loggerName.match(this.regex) !== null)
            console.log('%c' + level.toUpperCase(), this.logColours[level], new Date().toISOString(), this.loggerName, ...msg)
    }

    info(...msg) {
        this.output('info', ...msg)
    }

    debug(...msg) {
        this.output('debug', ...msg)
    }

    error(...msg) {
        this.output('error', ...msg)
    }

    warn(...msg) {
        this.output('warn', ...msg)
    }
}

export default CustomLogger