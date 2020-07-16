'use strict'

var getLine = function () {
  // console.log('getLine','dump',((new Error().stack).split('at ')[2]).trim().split(':')[2])
  return ((new Error().stack).split('at ')[2]).trim().split(':')[2]
}

var convertResultToJSON = function (req, res, next) {
  if (typeof res.result === 'object') {
    return res.json(res.result)
  }
  var err = new Error('Not Found')
  err.statusCode = 404
  next(err)
}

module.exports.getLine = getLine
module.exports.convertResultToJSON = convertResultToJSON
