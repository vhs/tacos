const path = require('path')

const debug = require('debug')('atoms:lib:stores')

const { config } = require('../config')
const { getLine } = require('../utils')

const dataDir = path.resolve(__dirname, '../../' + (process.env.ATOMS_DATA_DIR || config.datadir || 'data'))
const storesConfig = config.stores || { persistence: false, save_interval: 10000 }

debug(getLine(), 'Loading stores')
debug(getLine(), 'dataDir', dataDir)
debug(getLine(), 'storesConfig', storesConfig)

const deviceStore = require('./devices')(dataDir, storesConfig)
const terminalStore = require('./terminals')(dataDir, storesConfig)

module.exports = { deviceStore, terminalStore }
