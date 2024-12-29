'use strict'

const debug = require('debug')('tacos:lib:stores:devices')

const { config } = require('../../config/')
const { prisma } = require('../../db/prisma')
const { coerceMilliseconds } = require('../../utils')

const DeviceStore = function () {
    this.devices = prisma.devices

    if (this.devices == null) throw new Error('Missing devices')

    this.automaticDisarm()
}

DeviceStore.prototype.automaticDisarm = async function () {
    const armedDevices = await this.devices.findMany({
        where: {
            AND: [
                {
                    armed: {
                        equals: 1
                    }
                },
                {
                    activation_expiry: {
                        lt: Date.now()
                    }
                }
            ]
        }
    })

    if (armedDevices.length > 0) {
        armedDevices.forEach((armedDevice) => {
            void this.devices.update({
                where: { id: armedDevice.id },
                data: { armed: 0 }
            })
        })

        debug(
            'automaticDisarm',
            JSON.stringify(armedDevices.map((ad) => ad.id))
        )
    }
}

DeviceStore.prototype.getAllDevices = async function () {
    return await this.devices.findMany({ where: { id: { not: '' } } })
}

DeviceStore.prototype.getAvailableDevices = async function (user) {
    const devicesList = []

    const allDevices = await this.getAllDevices()

    for (const device of allDevices) {
        if ((await this.checkDeviceAccess(device.id, user)) === true) {
            devicesList.push(device)
        }
    }

    return devicesList
}

DeviceStore.prototype.registerDevice = async function (deviceId) {
    const deviceKey = { id: deviceId }
    const deviceLastSeen = { last_seen: Date.now() }

    const deviceResult = await this.devices.upsert({
        where: deviceKey,
        create: {
            ...deviceKey,
            description: deviceId,
            role: config.default_role,
            armed: 0,
            ...deviceLastSeen
        },
        update: deviceLastSeen
    })

    return deviceResult
}

DeviceStore.prototype.updateDeviceDescription = async function (
    deviceId,
    description
) {
    await this.devices.update({
        where: { id: deviceId },
        data: { description }
    })

    return this.getDeviceDetails(deviceId)
}

DeviceStore.prototype.updateDeviceRole = async function (deviceId, role) {
    await this.devices.update({
        where: { id: deviceId },
        data: { role }
    })

    return this.getDeviceDetails(deviceId)
}

DeviceStore.prototype.armDevice = async function (deviceId) {
    const deviceResult = await this.devices.findUnique({
        where: { id: deviceId }
    })

    if (deviceResult === null) return { error: 'No such device' }

    await this.devices.update({
        where: { id: deviceId },
        data: {
            armed: 1,
            activation_expiry:
                Date.now() +
                coerceMilliseconds(Number(config.activation_timeout))
        }
    })

    setTimeout(
        () => {
            void this.unarmDevice(deviceId)
        },
        coerceMilliseconds(Number(config.activation_timeout))
    )

    return this.getDeviceDetails(deviceId)
}

DeviceStore.prototype.unarmDevice = async function (deviceId) {
    const deviceResult = await this.devices.findUnique({
        where: { id: deviceId }
    })

    if (deviceResult === null) return { error: 'No such device' }

    await this.devices.update({
        where: { id: deviceId },
        data: {
            armed: 0
        }
    })

    return this.getDeviceDetails(deviceId)
}

DeviceStore.prototype.getDeviceList = async function () {
    return await this.getAllDevices()
}

DeviceStore.prototype.getDeviceState = async function (deviceId) {
    const deviceResult = await this.registerDevice(deviceId)

    const result = {}
    result.success = true
    result.id = deviceResult.id
    result.armed = deviceResult.armed
    result.role = deviceResult.role

    return result
}

DeviceStore.prototype.getDeviceDetails = async function (deviceId) {
    const deviceResult = await this.devices.findUnique({
        where: { id: deviceId }
    })

    if (deviceResult === null) return { error: 'No such device' }

    const result = {}
    result.success = true
    result.id = deviceResult.id
    result.last_seen = deviceResult.last_seen
    result.description = deviceResult.description
    result.role = deviceResult.role
    result.armed = deviceResult.armed

    return result
}

DeviceStore.prototype.getDeviceRole = async function (deviceId) {
    const deviceResult = await this.registerDevice(deviceId)

    const result = {}
    result.success = true
    result.id = deviceResult.id
    result.role = deviceResult.role
    result.armed = deviceResult.armed

    return result
}

DeviceStore.prototype.deleteDevice = async function (deviceId) {
    try {
        await this.devices.delete({ where: { id: deviceId } })
        return true
    } catch (err) {
        console.error(err)

        return false
    }
}

DeviceStore.prototype.checkDeviceExists = async function (deviceId) {
    const deviceResult = await this.devices.findUnique({
        where: { id: deviceId }
    })

    return deviceResult !== null
}

/**
 *
 * @param {*} deviceId
 * @param {*} user
 * @returns
 */
DeviceStore.prototype.checkDeviceAccess = async function (deviceId, user) {
    const deviceResult = await this.devices.findUnique({
        where: { id: deviceId }
    })

    if (user.administrator === true) return true

    return user.privileges.includes(deviceResult.role)
}

module.exports = new DeviceStore()
