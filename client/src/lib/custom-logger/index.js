const logColours = {
    info: '',
    debug: 'color: dodgerblue;font-weight:bold',
    error: 'color: orange;font-weight:bold',
    warn: 'color: indianred;font-weight:bold'
}

class CustomLogger {
    constructor(loggerName) {
        this.loggerName = loggerName
        this.logColours = logColours

        this.fallbackRegex = new RegExp(
            (localStorage.REACT_APP_DEBUG !== undefined
                ? localStorage.REACT_APP_DEBUG
                : '^$'
            )
                .replace(/\*/g, '.*')
                .replace(/,/, '|')
        )
        this.regex = this.fallbackRegex

        if (
            localStorage.NODE_ENV !== undefined &&
            localStorage.NODE_ENV === 'development'
        ) {
            setInterval(this.loadFromLocalStorage.bind(this), 1000)
        }
    }

    loadFromLocalStorage() {
        const overrides = [
            localStorage.getItem('DEBUG_OVERRIDE'),
            localStorage.getItem('DEBUG'),
            localStorage.getItem('REACT_APP_DEBUG')
        ].filter((e) => e != null)

        if (overrides.length > 0) {
            overrides.any((e) => {
                this.regex = new RegExp(
                    localStorage
                        .getItem('DEBUG_OVERRIDE')
                        .replace(/\*/g, '.*')
                        .replace(/,/, '|')
                )
            })
        } else {
            this.regex = this.fallbackRegex
        }
    }

    extend(newLoggerName) {
        return new CustomLogger(this.loggerName + ':' + newLoggerName)
    }

    output(level, ...msg) {
        if (this.loggerName.match(this.regex) !== null) {
            console.log(
                '%c' + level.toUpperCase(),
                this.logColours[level],
                new Date().toISOString(),
                this.loggerName,
                ...msg
            )
        }
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
