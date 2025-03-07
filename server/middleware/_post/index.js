const path = require('path')

const debug = require('debug')('app:middleware:_post')
const express = require('express')

const { withRateLimit } = require('../../lib/middleware/rate-limit')
const { wrappedJsonStringify } = require('../../lib/utils')

const router = express.Router()

router.get('/*', withRateLimit(25, 1), (_req, res) => {
    res.sendFile(path.resolve(path.join(__dirname, '../../public/index.html')))
})

// catch 404 and forward to error handler
router.use((_req, _res, next) => {
    const err = new Error('Not Found')
    next(Object.assign(err, { statusCode: 404 }))
})

router.use((_req, res, next) => {
    if (Object.keys(res.locals.result).length > 0) {
        return res.send(wrappedJsonStringify(res.locals.result))
    }
    const err = new Error('Not Found')
    next(Object.assign(err, { statusCode: 404 }))
})

// production error handler
// router.use((err, req, res, next) => {
//   debug(getLine(), err)
//   res.status(err.status || 500)
//   res.render('error', {
//     message: err.message || err,
//     error: {}
//   })
// })

router.use((err, _req, res, _next) => {
    // jshint ignore:line
    const response = {
        msg: err.message,
        type: err.type,
        status: err.statusCode || 500
    }
    if (response.status === 500) {
        debug('err:', err)
    }
    res.status(err.statusCode || 500)
    return res.json(response)
})

module.exports = { router }
