'use strict'

const fs = require('fs')
const http = require('http')
const https = require('https')
const path = require('path')

const { RedisStore } = require('connect-redis')
const cors = require('cors')
const debug = require('debug')('tacos:app')
const express = require('express')
const session = require('express-session')
const logger = require('morgan')
const { createClient } = require('redis')

const { config } = require('./lib/config')
const passport = require('./lib/passport')
const middleware = require('./middleware/')

// Initialize client.
const redisClient = createClient({
    url: `redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
})
redisClient.connect()

// Initialize store.
const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'tacos:session:'
})

const app = express()

if (process.env.HTTPS != null) console.log('Loading HTTPS server')

const server =
    process.env.HTTPS != null
        ? https.createServer(
              {
                  key: fs.readFileSync(
                      path.join(process.cwd(), 'certs/localhost.key')
                  ),
                  cert: fs.readFileSync(
                      path.join(process.cwd(), 'certs/localhost.crt')
                  )
              },
              app
          )
        : new http.Server(app)

debug('Setting up app')

if (config.proxy_addresses != null)
    app.set('trust proxy', config.proxy_addresses)

app.use(logger('dev'))
app.use(cors())

app.use(
    // @ts-ignore
    session({
        secret: config.sessions.secret,
        store: redisStore,
        resave: false,
        saveUninitialized: true,
        proxy: true,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 3600 * 24,
            sameSite: 'lax'
        },
        name: 'tacos',
        rolling: true
    })
)
app.use(express.json())
app.use(
    express.urlencoded({
        extended: true
    })
)

passport.init(app)

app.use(middleware.router)

module.exports = { app, server }
