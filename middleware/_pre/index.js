const debug = require('debug')('app:middleware:_pre')
const { getLine } = require('../../lib/utils')
debug(getLine(), 'Loading')

const path = require('path')

const express = require('express')
const router = express.Router()

router.use('/', express.static(path.resolve(path.join(__dirname, '../../frontend/build'))))

router.use('/', function (req, res, next) {
  res.locals.result = {}
  next()
})

module.exports = { router }
