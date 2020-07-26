const path = require('path')

const debug = require('debug')('tacos:lib:backend')
var { getLine } = require('../utils')
var { config } = require('../config')

var backend = require(path.resolve(path.join(__dirname, '../../backends/' + config.backend)))
backend.name = config.backend

module.exports = { backend }
