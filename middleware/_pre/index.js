const path = require('path')

const express = require('express')
const debug = require('debug')('app:middleware:_pre')
const router = express.Router();

router.use('/', express.static(path.resolve(path.join(__dirname,'../../frontend/build'))))

router.use("/", function(req, res, next){
    res.result = {};
    next();
});

module.exports = { router }