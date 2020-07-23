const path = require('path')

const debug = require('debug')('atoms:lib:stores')

const { config } = require('../config')
const { getLine } = require('../utils')

const dataDir = path.resolve(__dirname, '../../' + (process.env.TACOS_DATA_DIR || config.datadir || 'data'))

const deviceStore = require('./devices')(dataDir, storesConfig)
const terminalStore = require('./terminals')(dataDir, storesConfig)

module.exports = { deviceStore, terminalStore }
