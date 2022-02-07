const logColours = {
  info: '',
  debug: 'color: dodgerblue;font-weight:bold',
  error: 'color: orange;font-weight:bold',
  warn: 'color: indianred;font-weight:bold'
}

class CustomLogger {
  constructor (loggerName) {
    this.loggerName = loggerName
    this.logColours = logColours

    this.fallbackRegex = new RegExp(((process.env.REACT_APP_DEBUG !== undefined ? process.env.REACT_APP_DEBUG : '^$').replace(/\*/, '.*').replace(/,/, '|')))
    this.regex = this.fallbackRegex

    if (process.env !== undefined && process.env.NODE_ENV !== undefined && process.env.NODE_ENV === 'development') {
      setInterval(this.loadFromLocalStorage.bind(this), 1000)
    }
  }

  loadFromLocalStorage () {
    if (localStorage.getItem('DEBUG_OVERRIDE') !== null && localStorage.getItem('DEBUG') !== null) {
      this.regex = new RegExp(localStorage.getItem('DEBUG_OVERRIDE').replace(/\*/, '.*').replace(/,/, '|'))
    } else {
      this.regex = this.fallbackRegex
    }
  }

  extend (newLoggerName) {
    return new CustomLogger(this.loggerName + ':' + newLoggerName)
  }

  output (level, ...msg) {
    if (this.loggerName.match(this.regex) !== null) { console.log('%c' + level.toUpperCase(), this.logColours[level], new Date().toISOString(), this.loggerName, ...msg) }
  }

  info (...msg) {
    this.output('info', ...msg)
  }

  debug (...msg) {
    this.output('debug', ...msg)
  }

  error (...msg) {
    this.output('error', ...msg)
  }

  warn (...msg) {
    this.output('warn', ...msg)
  }
}

export default CustomLogger
