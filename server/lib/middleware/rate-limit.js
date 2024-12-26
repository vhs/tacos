const { rateLimit } = require('express-rate-limit')

const { config } = require('../config')

const trusted_ranges =
    typeof config.trusted_ranges === 'string'
        ? new RegExp(config.trusted_ranges)
        : /^(10\.|100\.64\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/

const defaultLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false
})

const withRateLimit = (limit, window, skipSuccessfulRequests) =>
    rateLimit({
        windowMs: window * 1000,
        limit,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        skipSuccessfulRequests: skipSuccessfulRequests ?? false,
        skip: (req, _res) => trusted_ranges.test(req.ip)
    })

module.exports = { defaultLimiter, withRateLimit }
