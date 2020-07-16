const path = require('path')

const debug = require('debug')('atoms:lib:config')

var config = require(path.join(__dirname, '../config/', (process.env.ATOMS_CONF || 'config')))

debug('Loaded configuration')

module.exports = config
