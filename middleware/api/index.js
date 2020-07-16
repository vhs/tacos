"use strict";

var express = require('express'),
    debug = require('debug')('app:middleware:api'),
    router = express.Router();

const { requireAuthenticated, requireAdmin } = require('../auth/lib')

const { doPong, getRoles } = require('./lib')

router.get("/ping", doPong)

router.get("/roles", requireAuthenticated, requireAdmin, getRoles)

module.exports.router = router;