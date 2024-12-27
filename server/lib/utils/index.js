'use strict'

const getLine = function () {
    return new Error().stack?.split('at ')[2].split(':')[1]
}

const convertResultToJSON = function (_req, res, next) {
    if (typeof res.locals.result === 'object') {
        return res
            .status(200)
            .setHeader('Content-Type', 'application/json')
            .send(wrappedJsonStringify(res.locals.result))
    }

    const err = new Error('Not Found')

    Object.assign(err, { statusCode: 404 })

    next(err)
}

const coerceMilliseconds = (val) => {
    if (Number.isNaN(val)) throw new Error('Cannot coerce invalid value')

    return val > 3600 ? val : val * 1000
}

const wrappedJsonStringify = (param) => {
    return JSON.stringify(param, (_key, value) =>
        typeof value === 'bigint' ? Number(value) : value
    )
}

module.exports = {
    coerceMilliseconds,
    convertResultToJSON,
    getLine,
    wrappedJsonStringify
}
