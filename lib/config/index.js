const path = require('path')

const debug = require('debug')('atoms:lib:config')

let configFile = (process.env.ATOMS_CONF || 'config')

debug('Loading configuration file:', path.resolve(path.join(__dirname, '../../config/', configFile)))

var config = require(path.resolve(path.join(__dirname, '../../config/', configFile)))

debug('Loaded configuration')

module.exports = { config }
