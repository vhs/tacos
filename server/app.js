'use strict'

const http = require('http')
const path = require('path')

const bodyParser = require('body-parser')
const loki = require('connect-loki')
const cors = require('cors')
const debug = require('debug')('tacos:app')
const express = require('express')
const session = require('express-session')
const logger = require('morgan')

const { config } = require('./lib/config')
const passport = require('./lib/passport')
const middleware = require('./middleware/')

const LokiStore = loki(session)

const lokiStoreOpts = {
    path: path.resolve(
        path.join(__dirname, '/', config.datadir, '/session-store.db')
    ),
    autosave: true
}

const app = express()
const server = http.createServer(app)

debug('Setting up app')

if (config.proxy_addresses != null)
    app.set('trust proxy', config.proxy_addresses)

app.use(logger('dev'))
app.use(cors())
app.use(
    bodyParser.urlencoded({
        extended: true
    })
)
app.use(bodyParser.json())
app.use(
    // @ts-ignore
    session({
        secret: config.sessions.secret,
        store: new LokiStore(lokiStoreOpts),
        resave: false,
        saveUninitialized: true,
        proxy: true,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 3600 * 24,
            sameSite: true
        },
        name: 'tacos',
        rolling: true
    })
)

passport.init(app)

app.use(middleware.router)

module.exports = { app, server }
