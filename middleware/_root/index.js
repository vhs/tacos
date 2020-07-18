"use strict";

const path = require('path')

var express = require('express'),
    debug = require('debug')('app:middleware:_root'),
    router = express.Router(),
    { config } = require('../../lib/config'),
    lib = require('./lib'),
    { backend } = require('../../lib/backend')

router.use('/', function (req, res, next) {
    res.locals.user = req.user;
    res.locals.roles = backend.getRoles();
    req.session.touch();
    next();
});

// Only on development
var environment = process.env.NODE_ENV || 'development';

if (environment == 'development')
    router.all('/reload', process.exit);

module.exports = { router };