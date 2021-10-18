'use strict'

const path = require('path')

const debug = require('debug')('tacos:app')

const express = require('express')
const cors = require('cors')
const logger = require('morgan')
const bodyParser = require('body-parser')
const session = require('express-session')
const LevelStore = require('express-session-level')(session)

const { config } = require('./lib/config')
const sessionDB = require('level')(path.resolve(path.join(__dirname, '/', config.datadir, '/sessiondb')))
const passport = require('./lib/passport')

const middleware = require('./middleware/')

const app = express()
const server = require('http').createServer(app)

debug('Setting up app')

app.use(logger('dev'))

app.use(cors())
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(session({
  secret: config.sessions.secret,
  // @ts-ignore
  store: new LevelStore(sessionDB),
  resave: false,
  saveUninitialized: true,
  proxy: true,
  cookie: {
    secure: false,
    maxAge: 1000 * 3600 * 24
  },
  name: 'tacos',
  rolling: true
}))

passport.init(app)

app.use(middleware.router)

module.exports = { app, server }
