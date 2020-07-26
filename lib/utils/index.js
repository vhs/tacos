'use strict'

var getLine = function () {
  return ((new Error().stack).split('at ')[2]).split(':')[1]
}

var convertResultToJSON = function (req, res, next) {
  if (typeof res.result === 'object') {
    return res.json(res.result)
  }
  var err = new Error('Not Found')
  err.statusCode = 404
  next(err)
}

module.exports = { getLine, convertResultToJSON }
