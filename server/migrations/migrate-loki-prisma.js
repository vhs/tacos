#!/usr/bin/env node

const path = require('node:path')

const debug = require('debug')('tacos:migrations:migrate-loki-prisma')
const Loki = require('lokijs')

const { config } = require(path.join(process.cwd(), 'lib/config'))
const { prisma } = require(path.join(process.cwd(), 'lib/db/prisma'))

function migrateDevices() {
    const deviceDB = new Loki(path.resolve(config.datadir, 'devicesStore.json'))

    deviceDB.loadDatabase({}, async (err) => {
        if (err) throw new Error('Failed to load deviceDB')
        debug('Loading devices database...')
        debug('Loading devices collection...')
        const devicesCollection = deviceDB.getCollection('devices')

        const devices = devicesCollection
            .find({ id: { $ne: '' } })
            .map((device) => {
                const { id, description, role, last_seen, armed } = device

                return {
                    id,
                    description,
                    role,
                    last_seen,
                    armed
                }
            })

        const result = await prisma.devices.createMany({ data: devices })

        debug('devices result:', result)
    })
}

function migrateLogging() {
    const loggingDB = new Loki(
        path.resolve(config.datadir, 'loggingStore.json')
    )

    loggingDB.loadDatabase({}, async (err) => {
        if (err) throw new Error('Failed to load loggingDB')
        debug('Loading logging database...')
        debug('Loading logging collection...')
        const loggingCollection = loggingDB.getCollection('logs')

        const logging = loggingCollection
            .find({ id: { $ne: '' } })
            .map((log) => {
                const { data, instance, level, message, ts } = log

                return {
                    data: data != null ? JSON.stringify(data) : null,
                    instance,
                    level,
                    message,
                    ts
                }
            })

        const result = await prisma.logging.createMany({ data: logging })

        debug('logging result:', result)
    })
}

function migrateTerminals() {
    const terminalsDB = new Loki(
        path.resolve(config.datadir, 'terminalStore.json')
    )

    terminalsDB.loadDatabase({}, async (err) => {
        if (err) throw new Error('Failed to load terminalsDB')
        debug('Loading terminals database...')
        debug('Loading terminals collection...')
        const terminalsCollection = terminalsDB.getCollection('terminals')

        const terminals = terminalsCollection
            .find({ id: { $ne: '' } })
            .map((terminal) => {
                const {
                    description,
                    enabled,
                    id,
                    last_seen,
                    secret,
                    secure,
                    target
                } = terminal

                return {
                    description,
                    enabled,
                    id,
                    last_seen,
                    secret,
                    secure,
                    target
                }
            })

        const result = await prisma.terminals.createMany({ data: terminals })

        debug('terminals result:', result)
    })
}

migrateDevices()
migrateLogging()
migrateTerminals()
