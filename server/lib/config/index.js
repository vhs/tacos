const path = require('path')

const debug = require('debug')('tacos:lib:config')

const { getLine } = require('../utils')

debug(getLine(), 'Loading configuration')

const config = require(
    path.resolve(
        path.join(
            __dirname,
            '../../config/',
            process.env.TACOS_CONF || 'config'
        )
    )
)

module.exports = { config }
