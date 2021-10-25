'use strict'

const getLine = function () {
  return ((new Error().stack).split('at ')[2]).split(':')[1]
}

const convertResultToJSON = function (req, res, next) {
  if (typeof res.locals.result === 'object') {
    return res.json(res.locals.result)
  }
  const err = new Error('Not Found')

  Object.assign(err, { statusCode: 404 })

  next(err)
}

module.exports = { getLine, convertResultToJSON }
