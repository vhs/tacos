"use strict";

var debug = require('debug')('app:middleware:_root:lib')
var { deviceStore } = require('../../../lib/stores')

function devicesStatuses(req, res, next) {
    if (req.user) {
        if (req.user.administrator) {
            res.locals.devices = devicesStore.getAllDevices();
        } else {
            res.locals.devices = devicesStore.getAvailableDevices(req.user);
        }
    }
    next();
}

module.exports = { devicesStatuses }