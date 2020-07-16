const path = require('path')

const dataDir = path.resolve(__dirname, '../../' + (process.env.ATOMS_DATA_DIR || 'data'))

const deviceStore = require('./devices')(dataDir)
const terminalStore = require('./terminals')(dataDir)

module.exports = { deviceStore, terminalStore }