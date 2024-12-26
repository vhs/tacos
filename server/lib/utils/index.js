'use strict'

const getLine = function () {
    return new Error().stack?.split('at ')[2].split(':')[1]
}

const convertResultToJSON = function (_req, res, next) {
    if (typeof res.locals.result === 'object') {
        return res.json(res.locals.result)
    }
    const err = new Error('Not Found')

    Object.assign(err, { statusCode: 404 })

    next(err)
}

const coerceMilliseconds = (val) => {
    if (Number.isNaN(val)) throw new Error('Cannot coerce invalid value')

    return val > 3600 ? val : val * 1000
}

module.exports = { coerceMilliseconds, convertResultToJSON, getLine }
