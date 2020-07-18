const path = require('path')

const express = require('express')
const debug = require('debug')('app:middleware:_post')
const router = express.Router();

router.get('/*', (req, res) => { res.sendFile(path.resolve(path.join(__dirname, '../../frontend/build/index.html'))) })

// catch 404 and forward to error handler
router.use((req, res, next) => {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
})

router.use((req, res, next) => {
    if (Object.keys(res.result).length > 0) {
        return res.json(res.result);
    }
    var err = new Error('Not Found');
    err.statusCode = 404;
    next(err);
});

// production error handler
// router.use((err, req, res, next) => {
//     debug(getLine(), err)
//     res.status(err.status || 500)
//     res.render('error', {
//         message: err.message || err,
//         error: {}
//     })
// })

router.use((err, req, res, next) => { // jshint ignore:line
    var response = {
        "msg": err.message,
        "type": err.type,
        "status": err.statusCode || 500
    };
    if (response.status === 500) {
        debug('err:', err);
    }
    res.status(err.statusCode || 500);
    return res.json(response);
});

module.exports = { router }