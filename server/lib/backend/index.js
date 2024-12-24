const path = require('path')

const debug = require('debug')('tacos:lib:backend')

const { config } = require('../config')
const { getLine } = require('../utils')

debug(getLine(), 'Loading backend:', config.backend)

const backend = require(
    path.resolve(path.join(__dirname, '../../backends/' + config.backend))
)
backend.name = config.backend

module.exports = { backend }
