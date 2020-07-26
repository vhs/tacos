const path = require('path')

const { config } = require('../config')

const dataDir = path.resolve(__dirname, '../../' + (process.env.TACOS_DATA_DIR || config.datadir || 'data'))

const deviceStore = require('./devices')(dataDir)
const loggingStore = require('./logging')(dataDir)
const terminalStore = require('./terminals')(dataDir)

module.exports = { deviceStore, loggingStore, terminalStore }