const path = require('path')

const debug = require('debug')('tacos:lib:config')

var config = require(path.resolve(path.join(__dirname, '../../config/', (process.env.TACOS_CONF || 'config'))))

debug('Loaded configuration')

module.exports = { config }
