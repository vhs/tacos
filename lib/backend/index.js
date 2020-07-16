const path = require('path')

const debug = require('debug')('atoms:lib:backend')
var { getLine } = require('../utils')
var config = require(path.join(__dirname, '../config'))

var backend = require(path.join(__dirname, '../../backends/' + config.backend))

module.exports = backend
