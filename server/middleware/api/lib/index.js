const { backend } = require('../../../lib/backend')

const doPong = function (_req, res, _next) {
    res.send({ result: 'PONG', message: 'PONG', ts: Date.now() })
}

const getRoles = function (_req, res, _next) {
    res.send({ roles: backend.getRoles() })
}

module.exports = { doPong, getRoles }
