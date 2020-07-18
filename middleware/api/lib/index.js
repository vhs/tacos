const { backend } = require('../../../lib/backend')

var doPong = function (req, res, next) {
    res.send({ result: "PONG", message: "PONG", ts: Date.now() })
}

var getRoles = function (req, res, next) {
    res.send({ roles: backend.getRoles() })
}

module.exports = { doPong, getRoles }