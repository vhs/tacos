const path = require('path')

const debug = require('debug')('tacos:lib:backend')
const { getLine } = require('../utils')
const { config } = require('../config')

debug(getLine(), 'Loading backend:', config.backend)

const backend = require(path.resolve(path.join(__dirname, '../../backends/' + config.backend)))
backend.name = config.backend

module.exports = { backend }
