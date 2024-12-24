const { backend } = require('../../../lib/backend')

const doPong = function (req, res, next) {
    res.send({ result: 'PONG', message: 'PONG', ts: Date.now() })
}

const getRoles = function (req, res, next) {
    res.send({ roles: backend.getRoles() })
}

module.exports = { doPong, getRoles }
