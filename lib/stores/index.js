const path = require('path')

const { config } = require('../config')

const dataDir = path.resolve(__dirname, '../../' + (process.env.ATOMS_DATA_DIR || config.datadir || 'data'))
const storesConfig = config.stores || { persistence: true, save_interval: 10000 }

const deviceStore = require('./devices')(dataDir, storesConfig)
const terminalStore = require('./terminals')(dataDir, storesConfig)

module.exports = { deviceStore, terminalStore }
