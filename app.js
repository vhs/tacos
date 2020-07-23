'use strict'

const path = require('path')

var debug = require('debug')('tacos:app')

var express = require('express')
var cors = require('cors')
var logger = require('morgan')
var bodyParser = require('body-parser')
var session = require('express-session')
var LevelStore = require('express-session-level')(session)

var { config } = require('./lib/config')
var sessionDB = require('level')(path.resolve(path.join(__dirname, '/', config.datadir, '/sessiondb')))
var { getLine } = require('./lib/utils')
var passport = require('./lib/passport')

var middleware = require('./middleware/')

var app = express()
var server = require('http').Server(app)

app.use(logger('dev'));

app.use(cors())
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(session({
  secret: config.sessions.secret,
  store: new LevelStore(sessionDB),
  resave: false,
  saveUninitialized: true,
  proxy: true,
  cookie: {
    secure: false,
    maxAge: 1000 * 3600 * 24
  },
  name: "tacos",
  rolling: true
}))

passport.init(app)

app.use(middleware.router)


module.exports = { app, server }
